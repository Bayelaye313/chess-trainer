import { describe, expect, it } from "vitest";
import { canCreateAccount, decideSignIn, describeDevice, initialsOf, parseEmailList, readAccessConfig, roleForEmail } from "./policy";

const config = readAccessConfig({ ADMIN_EMAILS: " Admin@Example.com , ", ALLOWED_EMAILS: "ami@example.com", SIGNUP_MODE: "allowlist" });

describe("politique d'accès", () => {
  it("normalise les listes d'emails", () => {
    expect([...parseEmailList(" A@x.fr,,b@Y.fr ")]).toEqual(["a@x.fr", "b@y.fr"]);
    expect(parseEmailList(undefined).size).toBe(0);
  });

  it("donne le rôle admin aux seuls emails d'ADMIN_EMAILS, sans tenir compte de la casse", () => {
    expect(roleForEmail("admin@example.com", config)).toBe("admin");
    expect(roleForEmail("ADMIN@example.com", config)).toBe("admin");
    expect(roleForEmail("ami@example.com", config)).toBe("user");
    // Email retiré de la liste : rétrogradé à la connexion suivante.
    expect(roleForEmail("admin@example.com", readAccessConfig({}))).toBe("user");
  });

  it("mode allowlist : seuls ALLOWED_EMAILS et ADMIN_EMAILS créent un compte", () => {
    expect(canCreateAccount("ami@example.com", config)).toBe(true);
    expect(canCreateAccount("admin@example.com", config)).toBe(true);
    expect(canCreateAccount("inconnu@example.com", config)).toBe(false);
    expect(canCreateAccount("inconnu@example.com", readAccessConfig({}))).toBe(true);
  });

  it("refuse les emails non vérifiés et les comptes suspendus", () => {
    expect(decideSignIn({ email: "ami@example.com", emailVerified: false, existingStatus: null }, config)).toEqual({ ok: false, reason: "unverified" });
    expect(decideSignIn({ email: "ami@example.com", emailVerified: true, existingStatus: "suspended" }, config)).toEqual({ ok: false, reason: "suspended" });
    expect(decideSignIn({ email: "inconnu@example.com", emailVerified: true, existingStatus: null }, config)).toEqual({ ok: false, reason: "not-allowed" });
    // Un compte déjà créé reste accessible même si l'allowlist a changé depuis.
    expect(decideSignIn({ email: "inconnu@example.com", emailVerified: true, existingStatus: "active" }, config)).toEqual({ ok: true });
  });

  it("calcule des initiales et un appareil approximatif", () => {
    expect(initialsOf("Jeanne Marie Martin", null)).toBe("JM");
    expect(initialsOf("", "zoe@example.com")).toBe("Z");
    expect(describeDevice("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36")).toBe("Chrome · Linux");
    expect(describeDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1")).toBe("Safari · iOS");
    expect(describeDevice(null)).toBeNull();
  });
});
