import { gql } from "@apollo/client";

export const registerMutation = gql`
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      code
      success
      message
      user {
        id
        username
        email
        createdAt
        updatedAt
      }
      errors {
        field
        message
      }
    }
  }
`;

export const loginMutation = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      code
      success
      message
      user {
        id
        username
        email
        createdAt
        updatedAt
      }
      errors {
        field
        message
      }
    }
  }
`;
