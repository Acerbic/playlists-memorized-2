declare module "passport/lib/errors/authenticationerror" {
    class AuthenticationError extends Error {}
    export default AuthenticationError;
}
