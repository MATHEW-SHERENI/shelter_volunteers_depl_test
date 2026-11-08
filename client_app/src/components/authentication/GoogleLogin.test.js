import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GoogleLogin } from "@react-oauth/google";
import Login from "./GoogleLogin";
import { loginAPI } from "../../api/login";
import { useAuth } from "../../contexts/AuthContext";

jest.mock("@react-oauth/google", () => ({ GoogleLogin: jest.fn() }));
jest.mock("../../api/login", () => ({ loginAPI: { login: jest.fn() } }));
jest.mock("../../contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("react-router-dom", () => ({ Link: ({ children }) => <span>{children}</span> }));

beforeEach(() => {
  jest.clearAllMocks();
  GoogleLogin.mockImplementation(({ onSuccess, onError }) => (
    <>
      <button onClick={() => onSuccess({ credential: "google-credential" })}>Google sign in</button>
      <button onClick={onError}>Google failure</button>
    </>
  ));
  useAuth.mockReturnValue({ login: jest.fn() });
});

test("exchanges the Google credential and signs in with the returned user", async () => {
  const user = { email: "volunteer@example.com", name: "Volunteer" };
  let finishSignIn;
  loginAPI.login.mockReturnValue(new Promise((resolve) => { finishSignIn = resolve; }));
  render(<Login />);

  fireEvent.click(screen.getByRole("button", { name: "Google sign in" }));
  expect(screen.getByRole("status")).toHaveTextContent("Signing in...");
  expect(useAuth().login).not.toHaveBeenCalled();
  await act(async () => { finishSignIn({ user }); });

  expect(loginAPI.login).toHaveBeenCalledWith("google-credential");
  expect(useAuth().login).toHaveBeenCalledWith(user);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("shows an API failure and allows retry without authenticating the user", async () => {
  loginAPI.login.mockRejectedValue(new Error("Google sign-in is unavailable"));
  render(<Login />);

  fireEvent.click(screen.getByRole("button", { name: "Google sign in" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Google sign-in is unavailable");
  expect(useAuth().login).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Google sign in" })).toBeInTheDocument();
});

test("shows a Google provider failure without calling the API", () => {
  render(<Login />);
  fireEvent.click(screen.getByRole("button", { name: "Google failure" }));

  expect(screen.getByRole("alert")).toHaveTextContent("Google sign-in did not complete");
  expect(loginAPI.login).not.toHaveBeenCalled();
  expect(useAuth().login).not.toHaveBeenCalled();
});

test.each([undefined, {}, { credential: "" }, { credential: "   " }])(
  "rejects a missing Google credential without calling the API (%j)",
  async (credentialResponse) => {
    render(<Login />);
    const { onSuccess } = GoogleLogin.mock.calls[0][0];

    await act(async () => { await onSuccess(credentialResponse); });

    expect(screen.getByRole("alert")).toHaveTextContent("Google sign-in did not complete");
    expect(loginAPI.login).not.toHaveBeenCalled();
    expect(useAuth().login).not.toHaveBeenCalled();
  }
);

test.each([undefined, {}, { user: {} }, { user: { email: "" } }])(
  "rejects an invalid API success response without authenticating (%j)",
  async (response) => {
    loginAPI.login.mockResolvedValue(response);
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: "Google sign in" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Unable to complete Google sign-in"));
    expect(useAuth().login).not.toHaveBeenCalled();
  }
);
