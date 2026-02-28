import { Router } from 'express';

import { ROLE } from '@config/roles';
import { authenticateJwt, requireRoles } from '@middleware/authMiddleware';
import { validateRequest } from '@middleware/validateRequest';
import {
  listTeamsByEvent,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  requestToJoinTeam,
  getPendingJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from './teams.service';
import {
  createTeamSchema,
  updateTeamSchema,
  joinTeamSchema,
  requestDecisionSchema,
} from './teams.validation';

export const teamsRouter = Router();

// Public routes
teamsRouter.get('/event/:eventId', async (req, res, next) => {
  try {
    const teams = await listTeamsByEvent(req.params.eventId);
    res.json(teams);
  } catch (err) {
    next(err);
  }
});

teamsRouter.get('/:id', async (req, res, next) => {
  try {
    const team = await getTeamById(req.params.id);
    res.json(team);
  } catch (err) {
    next(err);
  }
});

teamsRouter.use(authenticateJwt);

// Authenticated routes
teamsRouter.post('/:teamId/join', validateRequest(joinTeamSchema), async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await requestToJoinTeam(req.params.teamId, userId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// Team Lead and Admin routes
teamsRouter.get('/:id/join-requests', async (req, res, next) => {
  try {
    const requests = await getPendingJoinRequests(req.params.id);
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

teamsRouter.post(
  '/requests/:requestId/approve',
  validateRequest(requestDecisionSchema),
  requireRoles([ROLE.FACULTY_COORDINATOR, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN] as any),
  async (req, res, next) => {
    try {
      const result = await approveJoinRequest(req.params.requestId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

teamsRouter.post(
  '/requests/:requestId/reject',
  validateRequest(requestDecisionSchema),
  requireRoles([ROLE.FACULTY_COORDINATOR, ROLE.TEAM_LEAD, ROLE.ADMIN, ROLE.SUPER_ADMIN] as any),
  async (req, res, next) => {
    try {
      const result = await rejectJoinRequest(req.params.requestId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

// Admin routes
teamsRouter.post(
  '/',
  requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN] as any),
  validateRequest(createTeamSchema),
  async (req, res, next) => {
    try {
      const team = await createTeam((req as any).validated.body);
      res.status(201).json(team);
    } catch (err) {
      next(err);
    }
  },
);

teamsRouter.put(
  '/:id',
  requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.TEAM_LEAD] as any),
  validateRequest(updateTeamSchema),
  async (req, res, next) => {
    try {
      const updated = await updateTeam(req.params.id, (req as any).validated.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

teamsRouter.delete(
  '/:id',
  requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN] as any),
  async (req, res, next) => {
    try {
      await deleteTeam(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);
