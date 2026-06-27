import React from 'react';
import ReactDOM from 'react-dom/client';
import { ArrowRight, CircleDollarSign, Hammer, Home, MapPin, MessageSquare, Phone, ShieldCheck, Signpost, Sparkles } from 'lucide-react';
import logo from './assets/three-doors-logo.png';
import brandGraphic from './assets/three-doors-marketing-graphic-cropped.png';
import './styles.css';

const options = [
  {
    icon: CircleDollarSign,
    title: 'Cash Offer',
    description: 'A simpler path for homeowners who want speed, convenience, and fewer moving parts.',
    points: ['No showings required', 'No major repairs needed', 'Flexible closing timeline', 'Subject to property review'],
  },
  {
    icon: Hammer,
    title: 'Support Through Home Renovations',
    description: 'For homes that may benefit from updates before going to market, we help you think through the improvements that could unlock stronger value.',
    points: ['Practical renovation guidance', 'Market focused improvement strategy', 'Support before listing', 'Designed to help maximize buyer interest'],
  },
  {
    icon: Signpost,
    title: 'List The Property On The Market As Is',
    description: 'Sometimes the best move is bringing the property to market exactly as it stands and positioning it for the right buyers.',
    points: ['Traditional listing strategy', 'As is market positioning', 'Professional marketing', 'Clear pricing guidance'],
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
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
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
        <h1>Three Options For Home Sellers</h1>
        <p>
          Whether you want a quick cash offer, help preparing your home for market, or a traditional listing strategy,
          Three Doors Property Group helps you choose the path that fits your goals.
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
          <GoldRule label="One partner. Three doors." />
          <h2>Compare the path that fits your property, timeline, and goals.</h2>
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
          <h2>You do not have to know which option is right before reaching out.</h2>
          <p>
            That is the point. We help you understand what is possible so you can make a confident decision.
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

function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="section-inner about-panel">
        <div className="about-mark" aria-hidden="true">
          <Home size={52} strokeWidth={1.4} />
        </div>
        <div>
          <GoldRule label="Built for clarity" />
          <h2>One Partner. Three Doors. Your Best Outcome.</h2>
          <p>
            Three Doors Property Group was built to give homeowners more flexibility when it is time to sell. Every
            property and every situation is different, so the process should not feel one size fits all. Whether speed,
            strategy, preparation, or simplicity matters most, our role is to help you understand your options and move
            forward with clarity.
          </p>
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
          <GoldRule label="Explore your selling options" />
          <h2>Share a few details and we will help you understand the path that may make the most sense.</h2>
          <p>
            The first step is simple: tell us about the property, your timeline, and what matters most. From there,
            you can compare your options with more clarity.
          </p>
          <div className="contact-highlights">
            <span><Phone size={16} aria-hidden="true" /> Call or text placeholder</span>
            <span><MapPin size={16} aria-hidden="true" /> Local market guidance</span>
            <span><MessageSquare size={16} aria-hidden="true" /> Conversation first</span>
          </div>
        </div>
        <div className="tally-frame">
          <form className="tally-mock" onSubmit={handleSubmit}>
            <div className="tally-header">
              <img src={logo} alt="" aria-hidden="true" />
              <h3>Explore Your Selling Options</h3>
              <p>Share a few details about the property and we will help you understand which path may make the most sense.</p>
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

function FinalCta() {
  return (
    <section className="final-cta">
      <div className="section-inner final-cta-inner">
        <Sparkles aria-hidden="true" size={28} />
        <h2>Not sure which door is right for you?</h2>
        <p>
          That is exactly why we start with a conversation. Tell us about the property, and we will help you compare
          your options clearly.
        </p>
        <a className="button button-primary" href="#contact">
          Start The Conversation <ArrowRight aria-hidden="true" size={18} />
        </a>
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
          <p>Phone: (000) 000-0000</p>
          <p>Email: hello@threedoorspropertygroup.com</p>
          <p>Service area: Add local market details</p>
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
        <AboutSection />
        <LeadForm />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
