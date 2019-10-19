# Playlists Memorized (take 2)

Track YT (and, perhaps other media sources) playlists for changes.

## [working project docs][docs]

[docs]: https://www.notion.so/Playlists-Memorized-e1216d8ee6474886b1e3020e5907e2e7

## authorization (login) sequence

1. user visits a FRONTEND page
2. user clicks "login" link/button
3. the link redirects user to BACKEND /auth/google route
4. backend initiates authentication process with google flow:
5. ... redirects user's browser to Google authentication page
6. user authenticates with Google, gives consent (or refuses) to the app with
   requested permissions
7. after receiving user's consent, Google redirects user back to BACKEND to
   route /auth/google/callback
8. BACKEND either creates a new account for this user, or fetches existing
   account, creates a temporary authentication token (60 seconds to expire) and...
9. redirects user back to FRONTEND page /login_results with a query parameter
   containing the temporary authentication token.
10. FRONTEND script from the /login_results page parses query parameter and uses
    temporary authentication token to request a long term session token by
    fetching JSON response from /start_session BACKEND endpoint.
11. The long term session token is stored on the client for further requests.
    Validity of current session token can be verified by invoking
    /validate_token endpoint on the BACKEND.
