import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Link } from 'react-router-dom';
import { loginAPI } from '../../api/login';
import "../../styles/Login.css";
import {useAuth } from "../../contexts/AuthContext";

function Login() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSuccess = async (credentialResponse) => {
    setError("");
    const credential = credentialResponse?.credential;
    if (typeof credential !== "string" || !credential.trim()) {
      setError("Google sign-in did not complete. Please try again.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await loginAPI.login(credential);
      if (typeof response?.user?.email !== "string" || !response.user.email.trim()) {
        throw new Error("Unable to complete Google sign-in. Please try again.");
      }
      login(response.user);
    } catch (error) {
      setError(error?.message || "Unable to sign in with Google. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
    
  const onError = () => {
    setError("Google sign-in did not complete. Please try again.");
  };
  
    return (
      <div className="home-container landing-page" id="top">
        <header className="landing-nav">
          <a className="landing-brand" href="#top" aria-label="Volunteer Connect home">
            <span className="landing-brand-mark" aria-hidden="true">VC</span>
            <span>Volunteer Connect</span>
          </a>
          <nav className="landing-nav-links" aria-label="Main navigation">
            <a href="#how-it-works">How it works</a>
            <a className="landing-nav-cta" href="#sign-in">Sign in</a>
          </nav>
        </header>
        <main className="landing-main">
          <section className="landing-hero" aria-labelledby="landing-title">
            <div className="landing-copy">
              <p className="landing-eyebrow">
                <span className="landing-eyebrow-dot" aria-hidden="true" />
                Neighbors helping neighbors
              </p>
              <h1 id="landing-title">
                Good things happen when <span>communities show up.</span>
              </h1>
              <p className="landing-description">
                Volunteer Connect brings shelters and volunteers together to make
                local support easier to find, organize, and deliver.
              </p>
              <div className="landing-actions">
                <a className="landing-primary-cta" href="#sign-in">
                  Get started <span aria-hidden="true">→</span>
                </a>
                <a className="landing-text-cta" href="#how-it-works">
                  Explore how it works
                </a>
              </div>
              <p className="landing-reassurance">
                One sign-in connects you to the tools available for your role.
              </p>
            </div>
            <aside className="landing-signin" id="sign-in" aria-labelledby="signin-title">
              <div className="landing-signin-icon" aria-hidden="true">↗</div>
              <p className="landing-card-eyebrow">Welcome to the community</p>
              <h2 id="signin-title">Make a difference, together.</h2>
              <p className="landing-signin-description">
                Sign in to continue to your volunteer, shelter, or admin workspace.
              </p>
              <div className="google-login-wrapper" aria-busy={submitting}>
                {submitting ? <p role="status">Signing in...</p> : (
                  <GoogleLogin
                    onSuccess={onSuccess}
                    onError={onError}
                    theme="filled_blue"
                    type="standard"
                    shape="rectangular"
                    size="large"
                  />
                )}
              </div>
              {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
              <p className="landing-signin-note">
                Secure sign-in powered by Google
              </p>
              <p className="landing-admin-signin">
                Admin? <Link to="/admin-login">Sign in with email and password</Link>
              </p>
            </aside>
          </section>
          <section className="landing-process" id="how-it-works" aria-labelledby="process-title">
            <div className="landing-process-heading">
              <p className="landing-eyebrow">One connected effort</p>
              <h2 id="process-title">Support moves forward, together.</h2>
              <p>
                Each part of the community has a clear role in getting help where
                it is needed.
              </p>
            </div>
            <div className="landing-role-grid">
              <article className="landing-role-card landing-role-admin">
                <span className="landing-role-number">01</span>
                <p className="landing-role-label">Admin team</p>
                <h3>Build a trusted network</h3>
                <p>
                  Review and approve shelters, and manage access to the platform.
                </p>
              </article>
              <article className="landing-role-card landing-role-shelter">
                <span className="landing-role-number">02</span>
                <p className="landing-role-label">Shelter operators</p>
                <h3>Share where help is needed</h3>
                <p>
                  Publish open status and volunteer positions so the community
                  knows when support is needed.
                </p>
              </article>
              <article className="landing-role-card landing-role-volunteer">
                <span className="landing-role-number">03</span>
                <p className="landing-role-label">Volunteers</p>
                <h3>Turn intention into action</h3>
                <p>
                  Discover open opportunities and apply for a position that fits.
                </p>
              </article>
            </div>
          </section>
          <footer className="landing-footer">
            <span className="landing-brand-mark" aria-hidden="true">VC</span>
            <p>Volunteer Connect · Stronger communities start together.</p>
            <a href="#top">Back to top ↑</a>
          </footer>
        </main>
      </div>
    );
}
export default Login;
