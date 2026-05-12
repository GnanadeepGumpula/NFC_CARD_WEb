import { O as useRouter, r as reactExports, b as isRedirect, a4 as createServerFn, a1 as TSS_SERVER_FUNCTION, a5 as getServerFnById } from "./server-CUStlXIp.mjs";
import { o as objectType, s as stringType, b as booleanType, l as literalType } from "./types-4kcaak5A.mjs";
import { c as createLucideIcon } from "./createLucideIcon-DY3YDAUN.mjs";
function useServerFn(serverFn) {
  const router = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const getCardPublic = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  uniqueId: stringType().min(1).max(64)
}).parse(data)).handler(createSsrRpc("226084856f670f9546fc4bf0ed4bcac87c772d76d7796785584b016ab04f9121"));
const resetCardPin = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  uniqueId: stringType().min(1).max(64),
  token: stringType().min(10),
  newPin: stringType().min(4).max(12)
}).parse(data)).handler(createSsrRpc("6221053938c0173f6c1e822bc4e5423771c336a3766272232701d59bc3de6263"));
const initializePin = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  uniqueId: stringType().min(1).max(64),
  pin: stringType().regex(/^\d{4,6}$/)
}).parse(data)).handler(createSsrRpc("f90c0368815997267426a5c518fa1988ea7d334583e7c1236e888daa2bad5bbf"));
const unlockCard = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  uniqueId: stringType().min(1).max(64),
  pin: stringType().regex(/^\d{4,6}$/)
}).parse(data)).handler(createSsrRpc("02ee4c1c8d19a4ed6c7c40e3e17cfb891ede4a748037f9ddbf312b9252c0ca5f"));
const getCardWithToken = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  uniqueId: stringType().min(1).max(64),
  token: stringType().min(10).max(2e3)
}).parse(data)).handler(createSsrRpc("59a2d0ccb6db5d969f2e7fab70303eab4c1ff041f08061a5f7a29ed8520891fa"));
const adminLogin = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  password: stringType().min(1).max(200)
}).parse(data)).handler(createSsrRpc("a0e7ef66823054679044df3bbfaa541322c35b1c1665283361a5afe7c46ec503"));
const adminCardSchema = objectType({
  uniqueId: stringType().min(1).max(64),
  studentName: stringType().min(1).max(120),
  photoUrl: stringType().url().max(1e3).nullish().or(literalType("")),
  driveUrl: stringType().url().max(1e3).nullish().or(literalType("")),
  spotifyUrl: stringType().url().max(1e3).nullish().or(literalType("")),
  videoUrl: stringType().url().max(1e3).nullish().or(literalType("")),
  recoveryEmail: stringType().email().max(320).nullish().or(literalType(""))
});
const adminListCards = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  token: stringType().min(10).max(2e3)
}).parse(data)).handler(createSsrRpc("a6a863dec983f7770c24cb2b791823325c2547a7b455e8d9b43f81cdedf24e49"));
const adminUpsertCard = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  token: stringType().min(10).max(2e3),
  card: adminCardSchema,
  resetPin: booleanType().optional()
}).parse(data)).handler(createSsrRpc("cacd2e835da4eb24312e2a019678a4cfe9c059b73fe201aa54a1b16a0450980c"));
const adminDeleteCard = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  token: stringType().min(10).max(2e3),
  uniqueId: stringType().min(1).max(64)
}).parse(data)).handler(createSsrRpc("d5d513eef59514853804825d7b8489899d7d73398619e19e482af3063485ddad"));
const requestAdminPasswordResetFn = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  email: stringType().email().max(320),
  redirectTo: stringType().url().max(2e3)
}).parse(data)).handler(createSsrRpc("b314108a60b893e5291d11b8ac6a4b96b5332cfd534dcaeb04b690ec311a54e0"));
const changeAdminPasswordFn = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  token: stringType().min(10).max(2e3),
  currentPassword: stringType().min(1).max(200),
  newPassword: stringType().min(8).max(200)
}).parse(data)).handler(createSsrRpc("b29c5eefb528db86de0100ea059489ca51e1e53c41d654ec8505c4e9730af1fd"));
const completeAdminPasswordResetFn = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  accessToken: stringType().min(10).max(4e3),
  refreshToken: stringType().min(10).max(4e3),
  newPassword: stringType().min(8).max(200)
}).parse(data)).handler(createSsrRpc("1a2c5d07ced760193429a75ab846ad2235663a423051873759275ec373ea73d7"));
const storeCardRecoveryEmail = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  uniqueId: stringType().min(1).max(64),
  token: stringType().min(10).max(2e3),
  email: stringType().email().max(320)
}).parse(data)).handler(createSsrRpc("f47e75c0d7e9b61ac8a2827750cc0bae918e25623f1b4c0719083c7727c2cde3"));
const requestCardPinReset = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  uniqueId: stringType().min(1).max(64)
}).parse(data)).handler(createSsrRpc("6d2958037b5cd66680d6cb3579ad8039120a78c2acb9130ecff4c6c90c2663f1"));
const changeCardPin = createServerFn({
  method: "POST"
}).inputValidator((data) => objectType({
  uniqueId: stringType().min(1).max(64),
  token: stringType().min(10).max(2e3),
  currentPin: stringType().regex(/^\d{4,6}$/),
  newPin: stringType().regex(/^\d{4,6}$/)
}).parse(data)).handler(createSsrRpc("c1420b47c612c96bea88091cdddfc298b080a2d613b1d5466a3f03ae69b455bb"));
const __iconNode = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]];
const LoaderCircle = createLucideIcon("loader-circle", __iconNode);
export {
  LoaderCircle as L,
  adminListCards as a,
  adminLogin as b,
  completeAdminPasswordResetFn as c,
  changeAdminPasswordFn as d,
  adminUpsertCard as e,
  adminDeleteCard as f,
  getCardPublic as g,
  getCardWithToken as h,
  changeCardPin as i,
  requestCardPinReset as j,
  initializePin as k,
  unlockCard as l,
  resetCardPin as m,
  requestAdminPasswordResetFn as r,
  storeCardRecoveryEmail as s,
  useServerFn as u
};
