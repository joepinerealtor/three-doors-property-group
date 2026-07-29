import React from 'react';
import ReactDOM from 'react-dom/client';
import { ArrowRight, CircleDollarSign, Hammer, MapPin, MessageSquare, Phone, ShieldCheck, Signpost } from 'lucide-react';
import logo from './assets/three-doors-logo.png';
import brandGraphic from './assets/three-doors-marketing-graphic-cropped.png';
import './styles.css';

const options = [
  {
    icon: CircleDollarSign,
    title: 'Cash Offer',
    description: 'For sellers who want a simpler, more direct sale.',
    points: ['No showings required', 'No major repairs needed', 'Flexible closing timeline'],
  },
  {
    icon: Hammer,
    title: 'Support Through Home Renovations',
    description: 'For homes that may benefit from updates before listing.',
    points: ['Practical renovation guidance', 'Market focused strategy', 'Support before listing'],
  },
  {
    icon: Signpost,
    title: 'List The Property On The Market As Is',
    description: 'For sellers who want to list without taking on major prep work.',
    points: ['As-is market positioning', 'Professional marketing', 'Clear pricing guidance'],
  },
];

const steps = [
  'Tell us about the property',
  'Talk through your goals, timeline, and situation',
  'Compare your options and choose the best path',
];

function Header() {
  return (
    <header className="site-header">
      <a className="brand-link" href="#top" aria-label="Three Doors Property Group home">
        <img src={logo} alt="Three Doors Property Group" />
      </a>
      <nav className="site-nav" aria-label="Primary navigation">
        <a href="#options">Options</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#contact">Contact</a>
        <a href="./presentation.html">Presentation</a>
      </nav>
      <a className="nav-cta" href="#contact">
        Explore My Options
      </a>
    </header>
  );
}

function GoldRule({ label }) {
  return (
    <div className="gold-rule" aria-hidden={!label}>
      <span />
      {label && <strong>{label}</strong>}
      <span />
    </div>
  );
}

function Hero() {
  return (
    <section className="hero section-shell" id="top">
      <div className="hero-media">
        <img src={brandGraphic} alt="Three Doors Property Group home seller options graphic" />
      </div>
      <div className="hero-copy">
        <GoldRule label="Flexible solutions. Focused on your goals." />
        <h1>
          <span>Three Options</span>
          <span>For Home</span>
          <span>Sellers</span>
        </h1>
        <p>
          Compare a cash offer, renovation support, or an as-is listing strategy before you decide what to do next.
        </p>
        <div className="hero-actions" aria-label="Hero actions">
          <a className="button button-primary" href="#contact">
            Find My Best Option <ArrowRight aria-hidden="true" size={18} />
          </a>
          <a className="button button-secondary" href="#how-it-works">
            Learn How It Works
          </a>
        </div>
        <div className="trust-line">
          <ShieldCheck aria-hidden="true" size={18} />
          <span>No pressure. Clear options. A selling path built around your timeline.</span>
        </div>
      </div>
    </section>
  );
}

function OptionCard({ option, index }) {
  const Icon = option.icon;

  return (
    <article className="option-card">
      <div className="option-icon" aria-hidden="true">
        <Icon size={34} strokeWidth={1.8} />
      </div>
      <div className="option-content">
        <p className="option-number">Option {index + 1}</p>
        <h3>{option.title}</h3>
        <p>{option.description}</p>
        <ul>
          {option.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function OptionsSection() {
  return (
    <section className="options-section" id="options">
      <div className="section-inner">
        <div className="section-heading">
          <GoldRule label="The three paths" />
          <h2>Pick the option that fits your property and timeline.</h2>
        </div>
        <div className="options-grid">
          {options.map((option, index) => (
            <OptionCard key={option.title} option={option} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="process-section" id="how-it-works">
      <div className="section-inner process-grid">
        <div>
          <GoldRule label="How it works" />
          <h2>You do not need to know the right option before reaching out.</h2>
          <p>
            Send the property details, talk through your goals, and compare the paths side by side.
          </p>
        </div>
        <div className="steps-list">
          {steps.map((step, index) => (
            <article className="step-card" key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{step}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function LeadForm() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  };

  return (
    <section className="lead-section" id="contact">
      <div className="section-inner lead-grid">
        <div className="lead-copy">
          <GoldRule label="Start here" />
          <h2>Tell us about the property. We will help you compare your options.</h2>
          <p>
            You are not committing to anything by filling this out. It simply gives us enough information to start the
            conversation.
          </p>
          <div className="contact-highlights">
            <span><Phone size={16} aria-hidden="true" /> Quick follow-up</span>
            <span><MapPin size={16} aria-hidden="true" /> Property review first</span>
            <span><MessageSquare size={16} aria-hidden="true" /> Clear next step</span>
          </div>
        </div>
        <div className="tally-frame">
          <form className="tally-mock" onSubmit={handleSubmit}>
            <div className="tally-header">
              <img src={logo} alt="" aria-hidden="true" />
              <h3>Explore Your Selling Options</h3>
              <p>Share the basics and we will follow up to compare your selling paths.</p>
            </div>

            <div className="tally-question-grid">
              <Field label="First name">
                <input name="firstName" type="text" autoComplete="given-name" required />
              </Field>
              <Field label="Last name">
                <input name="lastName" type="text" autoComplete="family-name" required />
              </Field>
              <Field label="Email">
                <input name="email" type="email" autoComplete="email" required />
              </Field>
              <Field label="Phone">
                <input name="phone" type="tel" autoComplete="tel" required />
              </Field>
            </div>

            <Field label="Property address">
              <input name="address" type="text" autoComplete="street-address" required />
            </Field>

            <div className="tally-question-grid compact">
              <Field label="City">
                <input name="city" type="text" autoComplete="address-level2" required />
              </Field>
              <Field label="State">
                <input name="state" type="text" autoComplete="address-level1" required />
              </Field>
            </div>

            <fieldset className="choice-field">
              <legend>What best describes your timeline?</legend>
              <div className="choice-grid">
                {['As soon as possible', 'Within 30 days', '1 to 3 months', '3 to 6 months', 'Just exploring'].map((choice) => (
                  <label key={choice}>
                    <input type="radio" name="timeline" value={choice} required />
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="choice-field">
              <legend>Which option are you most interested in?</legend>
              <div className="choice-grid">
                {['Cash offer', 'Renovation support', 'List as is', 'Not sure yet'].map((choice) => (
                  <label key={choice}>
                    <input type="radio" name="interest" value={choice} required />
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Field label="Property condition">
              <select name="condition" required defaultValue="">
                <option value="" disabled>Select condition</option>
                <option>Move in ready</option>
                <option>Needs minor updates</option>
                <option>Needs major updates</option>
                <option>Vacant</option>
                <option>Inherited property</option>
                <option>Other</option>
              </select>
            </Field>

            <label className="field">
              <span>Tell us anything else we should know</span>
              <textarea name="message" rows="4" />
            </label>

            <button className="button button-primary form-button" type="submit">
              Show Me My Options <ArrowRight aria-hidden="true" size={18} />
            </button>
            <p className="privacy-note">Your information will only be used to follow up about your property and selling options.</p>
            {submitted && (
              <p className="success-message" role="status">
                Thank you. Your information has been received and someone will follow up with you soon.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-inner footer-grid">
        <div>
          <img src={logo} alt="Three Doors Property Group" />
          <p>Three options. One trusted partner.</p>
        </div>
        <div className="footer-contact">
          <p>Phone: <a href="tel:+14014992978">401-499-2978</a></p>
          <p>Email: <a href="mailto:threedoorspropertygroup@gmail.com">threedoorspropertygroup@gmail.com</a></p>
        </div>
      </div>
      <div className="section-inner footer-bottom">
        <p>&copy; {new Date().getFullYear()} Three Doors Property Group. All rights reserved.</p>
        <p>
          Information provided is for general guidance only. Any offer, renovation option, or listing strategy is subject
          to property review, market conditions, and written agreement.
        </p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <OptionsSection />
        <HowItWorks />
        <LeadForm />
      </main>
      <Footer />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
