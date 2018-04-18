'use strict';
const Joi = require('joi');
const db = require('../modules/db')();
const error = require('../modules/error-reply');

const acl = (request, reply) => {
  if (process.env.NODE_ENV === 'development') return;
  const { isAuthenticated, team } = request.auth;
  if (!isAuthenticated) {
    reply({ ok: false, message: 'not authed' }).code(401);
    return true;
  } else if (isAuthenticated) {
    if (team.domain !== 'walkiebotco' && team.domain !== 'foundersas') {
      reply({ ok: false, message: 'forbidden' }).code(403);
      return true;
    }
  }
};

module.exports = (auth, server) => {
  const io = require('socket.io')(server.listener);

  io.on('connection', socket =>
    console.log(`[WALKIE][SocketIO][Client connected]`));
  io.on('ping', socket => socket.emit('pong'));

  return {
    'get-all-for-user': {
      method: 'GET',
      config: {
        auth,
        validate: {
          params: {
            userId: Joi.string().required()
          }
        }
      },
      path: '/api/notifications/{userId}',
      handler: (request, reply) => {
        console.log(`[WALKIE][${request.method}][${request.url.path}]`);
        const { userId } = request.params;
        db.notifications.getNewForUserId(userId, (err, notifications) => {
          if (err) return error(reply, err);
          return reply({ ok: true, data: notifications });
        });
      }
    },
    'get-all': {
      method: 'GET',
      config: { auth },
      path: '/api/notifications',
      handler: (request, reply) => {
        console.log(`[WALKIE][${request.method}][${request.url.path}]`);
        if (acl(request, reply)) return;

        db.notifications.getAll((err, notifications) => {
          if (err) return error(reply, err);
          return reply({ ok: true, data: notifications });
        });
      }
    },
    'delete': {
      method: 'DELETE',
      config: {
        auth,
        validate: {
          params: {
            notificationId: Joi.string().required()
          }
        }
      },
      path: '/api/notifications/{notificationId}',
      handler: (request, reply) => {
        console.log(`[WALKIE][${request.method}][${request.url.path}]`);
        const { notificationId } = request.params;
        if (acl(request, reply)) return;

        db.notifications.remove(notificationId, (err) => {
          if (err) return error(reply, err);
          return reply({ ok: true });
        });
      }
    },
    'acknowledge': {
      method: 'PUT',
      config: {
        auth,
        validate: {
          params: {
            notificationId: Joi.string().required(),
            userId: Joi.string().required()
          }
        }
      },
      path: '/api/notifications/{notificationId}/{userId}',
      handler: (request, reply) => {
        console.log(`[WALKIE][${request.method}][${request.url.path}]`);
        const { notificationId, userId } = request.params;
        db.notifications.acknowledge(notificationId, userId, (err) => {
          if (err) return error(reply, err);
          return reply({ ok: true });
        });
      }
    },
    'new': {
      method: 'POST',
      config: {
        auth,
        validate: {
          payload: {
            message: Joi.string().required(),
            severity: Joi.string().required().allow(['low', 'medium', 'high']),
            startDate: Joi.date().iso().required(),
            endDate: Joi.date().iso().min('now').required()
          }
        }
      },
      path: '/api/notifications',
      handler: (request, reply) => {
        console.log(`[WALKIE][${request.method}][${request.url.path}]`);
        const {
          message,
          severity,
          startDate,
          endDate
        } = request.payload;
        if (acl(request, reply)) return;

        db.notifications.create(message, severity, startDate, endDate, (err, notification) => {
          if (err) return error(reply, err);

          const clientNotification = Object.assign(request.payload, { notificationId: notification.notificationId });
          io.sockets.emit('broadcast_notification', clientNotification);

          return reply({ ok: true, data: notification });
        });
      }
    }
  };
};
