// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Post, Comment, Chat } = initSchema(schema);

export {
  Post,
  Comment,
  Chat
};