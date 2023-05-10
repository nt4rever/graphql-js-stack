import { FieldError } from "../gql/graphql";

export const mapFieldErrors = (
  errors: FieldError[]
): { [key: string]: string } => {
  return errors.reduce(
    (acc, err) => ({ ...acc, [err.field]: err.message }),
    {}
  );
};
