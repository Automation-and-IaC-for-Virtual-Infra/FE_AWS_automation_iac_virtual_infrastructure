// lib/cognito.ts
import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: 'ap-southeast-1_y2siEnzeG',
  ClientId: '5el0b6lh44hf56e5sbpu29clr6',
};

export const userPool = new CognitoUserPool(poolData);
