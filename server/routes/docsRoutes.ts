import { Router, Request, Response } from 'express';
import { getDBStatus } from '../config/db.ts';

const router = Router();

router.get(['/', '/health'], (req: Request, res: Response) => {
  const dbStatus = getDBStatus();
  return res.json({
    status: 'online',
    platform: 'NEXUS Social Media Platform',
    version: '1.0.0',
    collegeProject: 'Major Engineering Project (MERN Stack + Socket.io)',
    database: dbStatus,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

router.get('/postman', (req: Request, res: Response) => {
  const baseUrl = '{{baseUrl}}';
  const postmanCollection = {
    info: {
      name: 'NEXUS Full-Stack Social Media API Collection',
      description: 'Postman test collection for NEXUS MERN Stack Social Media Platform. Contains all Authentication, User, Post, Comment, Follow, Notification, and Chat endpoints.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    variable: [
      { key: 'baseUrl', value: 'http://localhost:3000/api', type: 'string' },
      { key: 'authToken', value: '', type: 'string' },
      { key: 'postId', value: '65f1b022b022b022b0220001', type: 'string' },
      { key: 'userId', value: '65f1a011a011a011a0110002', type: 'string' },
      { key: 'conversationId', value: '65f1d044d044d044d0440001', type: 'string' }
    ],
    item: [
      {
        name: '1. Authentication',
        item: [
          {
            name: 'Register User',
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  name: 'Demo Student',
                  username: 'demostudent',
                  email: 'student@college.edu',
                  password: 'Password123!',
                  confirmPassword: 'Password123!',
                  bio: 'Final year CSE student building full-stack platforms.'
                }, null, 2)
              },
              url: { raw: `${baseUrl}/auth/register` }
            }
          },
          {
            name: 'Login User',
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  identifier: 'alex@nexus.social',
                  password: 'Password123!'
                }, null, 2)
              },
              url: { raw: `${baseUrl}/auth/login` }
            }
          },
          {
            name: 'Get Current User (Me)',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{authToken}}' }],
              url: { raw: `${baseUrl}/auth/me` }
            }
          },
          {
            name: 'Logout',
            request: {
              method: 'POST',
              header: [{ key: 'Authorization', value: 'Bearer {{authToken}}' }],
              url: { raw: `${baseUrl}/auth/logout` }
            }
          }
        ]
      },
      {
        name: '2. Users & Profiles',
        item: [
          {
            name: 'Get User Profile',
            request: {
              method: 'GET',
              url: { raw: `${baseUrl}/users/{{userId}}` }
            }
          },
          {
            name: 'Search Users',
            request: {
              method: 'GET',
              url: { raw: `${baseUrl}/users/search?q=alex` }
            }
          },
          {
            name: 'Update Profile',
            request: {
              method: 'PUT',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{authToken}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  name: 'Alex River',
                  bio: 'Updated bio: Building full-stack web applications with MERN & Socket.io!'
                }, null, 2)
              },
              url: { raw: `${baseUrl}/users/{{userId}}` }
            }
          },
          {
            name: 'Follow User',
            request: {
              method: 'POST',
              header: [{ key: 'Authorization', value: 'Bearer {{authToken}}' }],
              url: { raw: `${baseUrl}/users/{{userId}}/follow` }
            }
          },
          {
            name: 'Unfollow User',
            request: {
              method: 'DELETE',
              header: [{ key: 'Authorization', value: 'Bearer {{authToken}}' }],
              url: { raw: `${baseUrl}/users/{{userId}}/follow` }
            }
          },
          {
            name: 'Get User Followers',
            request: {
              method: 'GET',
              url: { raw: `${baseUrl}/users/{{userId}}/followers` }
            }
          },
          {
            name: 'Get User Following',
            request: {
              method: 'GET',
              url: { raw: `${baseUrl}/users/{{userId}}/following` }
            }
          }
        ]
      },
      {
        name: '3. Posts & Social Feed',
        item: [
          {
            name: 'Get Feed / Posts',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{authToken}}' }],
              url: { raw: `${baseUrl}/posts?feed=true` }
            }
          },
          {
            name: 'Get Explore Posts',
            request: {
              method: 'GET',
              url: { raw: `${baseUrl}/posts` }
            }
          },
          {
            name: 'Create Post',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{authToken}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  caption: 'Testing the NEXUS social media REST API via Postman! #CollegeProject #FullStack',
                  image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
                  hashtags: ['CollegeProject', 'FullStack']
                }, null, 2)
              },
              url: { raw: `${baseUrl}/posts` }
            }
          },
          {
            name: 'Get Post By ID',
            request: {
              method: 'GET',
              url: { raw: `${baseUrl}/posts/{{postId}}` }
            }
          },
          {
            name: 'Update Post',
            request: {
              method: 'PUT',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{authToken}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  caption: 'Updated caption for my project post!'
                }, null, 2)
              },
              url: { raw: `${baseUrl}/posts/{{postId}}` }
            }
          },
          {
            name: 'Delete Post',
            request: {
              method: 'DELETE',
              header: [{ key: 'Authorization', value: 'Bearer {{authToken}}' }],
              url: { raw: `${baseUrl}/posts/{{postId}}` }
            }
          },
          {
            name: 'Like Post',
            request: {
              method: 'POST',
              header: [{ key: 'Authorization', value: 'Bearer {{authToken}}' }],
              url: { raw: `${baseUrl}/posts/{{postId}}/like` }
            }
          },
          {
            name: 'Unlike Post',
            request: {
              method: 'DELETE',
              header: [{ key: 'Authorization', value: 'Bearer {{authToken}}' }],
              url: { raw: `${baseUrl}/posts/{{postId}}/like` }
            }
          }
        ]
      },
      {
        name: '4. Comments',
        item: [
          {
            name: 'Get Post Comments',
            request: {
              method: 'GET',
              url: { raw: `${baseUrl}/posts/{{postId}}/comments` }
            }
          },
          {
            name: 'Add Comment',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{authToken}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  content: 'Outstanding implementation! The MERN stack handles this seamlessly.'
                }, null, 2)
              },
              url: { raw: `${baseUrl}/posts/{{postId}}/comments` }
            }
          }
        ]
      },
      {
        name: '5. Real-Time Chat & Messages',
        item: [
          {
            name: 'Get User Conversations',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{authToken}}' }],
              url: { raw: `${baseUrl}/conversations` }
            }
          },
          {
            name: 'Get / Create Conversation',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{authToken}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  recipientId: '{{userId}}'
                }, null, 2)
              },
              url: { raw: `${baseUrl}/conversations` }
            }
          },
          {
            name: 'Get Messages for Conversation',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{authToken}}' }],
              url: { raw: `${baseUrl}/messages/{{conversationId}}` }
            }
          },
          {
            name: 'Send Message (HTTP Fallback / Initial)',
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{authToken}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  conversationId: '{{conversationId}}',
                  receiverId: '{{userId}}',
                  content: 'Hello from Postman! Real-time Socket.io and MongoDB sync active.'
                }, null, 2)
              },
              url: { raw: `${baseUrl}/messages` }
            }
          }
        ]
      },
      {
        name: '6. Notifications',
        item: [
          {
            name: 'Get Notifications',
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{authToken}}' }],
              url: { raw: `${baseUrl}/notifications` }
            }
          },
          {
            name: 'Mark All Read',
            request: {
              method: 'PUT',
              header: [{ key: 'Authorization', value: 'Bearer {{authToken}}' }],
              url: { raw: `${baseUrl}/notifications/read-all` }
            }
          }
        ]
      }
    ]
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="nexus_postman_collection.json"');
  return res.json(postmanCollection);
});

export default router;
