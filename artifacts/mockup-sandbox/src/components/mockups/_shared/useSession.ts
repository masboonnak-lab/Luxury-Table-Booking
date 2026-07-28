import { useCallback, useEffect, useState } from "react";

import { api, ApiError, type AuthUser } from "./api";

export type SessionState =
  | { status: "loading" }
  | { status: "signed-out"; reason?: string }
  | { status: "signed-in"; user: AuthUser };

/**
 * Who is signed in, asked of the server rather than kept in localStorage: the
 * session lives in an httpOnly cookie the page cannot read, which is the point
 * of it being httpOnly.
 *
 * A 401 is the normal signed-out answer. Anything else — the API not running,
 * a proxy returning HTML — is reported as a reason, so "cannot reach the
 * server" never renders as "not signed in".
 */
export function useSession() {
  const [state, setState] = useState<SessionState>({ status: "loading" });

  const refresh = useCallback(async () => {
    try {
      const user = await api.me();
      setState({ status: "signed-in", user });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setState({ status: "signed-out" });
        return;
      }
      setState({
        status: "signed-out",
        reason:
          err instanceof ApiError ? err.message : "ติดต่อเซิร์ฟเวอร์ไม่ได้",
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setState({ status: "signed-out" });
    }
  }, []);

  const signedIn = useCallback((user: AuthUser) => {
    setState({ status: "signed-in", user });
  }, []);

  return { state, refresh, signOut, signedIn };
}
