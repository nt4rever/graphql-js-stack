import { FieldError } from "../generated/graphql";

export const mapFieldErrors = (
  errors: FieldError[]
): { [key: string]: string } => {
  return errors.reduce(
    (acc, err) => ({ ...acc, [err.field]: err.message }),
    {}
  );
};
