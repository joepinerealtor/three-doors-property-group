import React from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  HandHeart,
  Hammer,
  HeartHandshake,
  Home,
  Landmark,
  Link2,
  MapPin,
  MessageSquare,
  Phone,
  Printer,
  Scale,
  Share2,
  Signpost,
  Sparkles,
  Users,
} from 'lucide-react';
import logo from './assets/three-doors-logo.png';
import brandGraphic from './assets/three-doors-marketing-graphic-cropped.png';
import mattHeadshot from './assets/matt-brown-headshot.jpg';
import lightLogo from '../brand-package/exports/png/full-logo-reverse-transparent.png';
import './presentation.css';

const PUBLIC_SITE_URL = 'https://3doors.ridge-form.com/';

const presentationSections = [
  { href: '#welcome', label: 'Overview' },
  { href: '#about', label: 'About Matt' },
  { href: '#doors', label: 'Three Doors' },
  { href: '#analysis', label: 'Property Review' },
  { href: '#impact', label: 'Community' },
  { href: '#next-steps', label: 'Next Steps' },
  { href: '#contact', label: 'Contact' },
];

const doors = [
  {
    number: '01',
    icon: CircleDollarSign,
    title: 'Sell Directly',
    subtitle: 'A simpler sale with a flexible timeline.',
    bestFor: 'Homeowners who value speed, certainty, and less preparation.',
    points: [
      'A fair cash offer based on the property review',
      'No repairs, cleaning, showings, or commissions',
      'A closing timeline shaped around your needs',
      'A straightforward, lower-stress process',
    ],
  },
  {
    number: '02',
    icon: Hammer,
    title: 'Renovate for Maximum Value',
    subtitle: 'Make strategic improvements before going to market.',
    bestFor: 'Homes where focused improvements may create meaningful additional value.',
    points: [
      'Evaluate which improvements are worth considering',
      'Coordinate the work with a trusted team',
      'Discuss financing options when available and appropriate',
      'Help the homeowner retain more equity whenever practical',
    ],
  },
  {
    number: '03',
    icon: Signpost,
    title: 'List Traditionally',
    subtitle: 'Use the open market when it offers the best outcome.',
    bestFor: 'Sellers who want maximum market exposure and a full listing strategy.',
    points: [
      'Thoughtful pricing and positioning',
      'Professional marketing and broad visibility',
      'Support from trusted real estate professionals',
      'A strategy focused on the homeowner’s best result',
    ],
  },
];

const partnerGroups = [
  { icon: Home, label: 'Homeowners' },
  { icon: Users, label: 'Senior living communities' },
  { icon: Scale, label: 'Elder law and probate attorneys' },
  { icon: HeartHandshake, label: 'Housing nonprofits' },
  { icon: Building2, label: 'Community organizations' },
  { icon: Landmark, label: 'Municipal housing departments' },
  { icon: Hammer, label: 'Contractors and restoration teams' },
  { icon: HandHeart, label: 'Faith-based and social service agencies' },
];

function SectionEyebrow({ children }) {
  return (
    <p className="presentation-eyebrow">
      <span aria-hidden="true" />
      {children}
    </p>
  );
}

function SectionCta({ children, label = 'Explore your options' }) {
  return (
    <div className="section-cta screen-only">
      <p>{children}</p>
      <a href="#contact">
        {label} <ArrowRight size={17} aria-hidden="true" />
      </a>
    </div>
  );
}

function FloatingLeadCta() {
  const [formIsVisible, setFormIsVisible] = React.useState(false);

  React.useEffect(() => {
    const formSection = document.querySelector('#contact');
    if (!formSection) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setFormIsVisible(entry.isIntersecting),
      { threshold: 0.08 },
    );

    observer.observe(formSection);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      className={`floating-lead-cta screen-only${formIsVisible ? ' is-hidden' : ''}`}
      href="#contact"
      aria-label="Ready to explore your options? Go to the information form."
    >
      <span>Ready to explore your options?</span>
      <strong>Tell us about the property</strong>
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
}

function PresentationNav() {
  const [activeHref, setActiveHref] = React.useState('#welcome');
  const [copied, setCopied] = React.useState(false);
  const shareMenuRef = React.useRef(null);
  const jumpMenuRef = React.useRef(null);

  React.useEffect(() => {
    const sectionElements = presentationSections
      .map((section) => document.querySelector(section.href))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveHref(`#${visible[0].target.id}`);
        }
      },
      { rootMargin: '-24% 0px -58% 0px', threshold: [0, 0.15, 0.4] },
    );

    sectionElements.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const closeMenus = (event) => {
      [shareMenuRef.current, jumpMenuRef.current].forEach((menu) => {
        if (menu?.open && !menu.contains(event.target)) {
          menu.removeAttribute('open');
        }
      });
    };

    document.addEventListener('pointerdown', closeMenus);
    return () => document.removeEventListener('pointerdown', closeMenus);
  }, []);

  const closeMenu = (ref) => {
    ref.current?.removeAttribute('open');
  };

  const getShareUrl = () => PUBLIC_SITE_URL;

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: 'Three Doors Property Group',
        text: 'Explore Three Doors homeowner solutions and community partnerships.',
        url: getShareUrl(),
      });
      closeMenu(shareMenuRef);
    } catch (error) {
      if (error?.name !== 'AbortError') {
        await handleCopyLink();
      }
    }
  };

  const handleCopyLink = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(getShareUrl());
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = getShareUrl();
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
      closeMenu(shareMenuRef);
    }, 1600);
  };

  return (
    <header className="presentation-nav screen-only">
      <a className="presentation-brand" href="#welcome" aria-label="Three Doors Property Group home">
        <img src={lightLogo} alt="Three Doors Property Group" />
      </a>
      <nav className="presentation-jumps" aria-label="Presentation sections">
        {presentationSections.map((section) => (
          <a
            key={section.href}
            href={section.href}
            aria-current={activeHref === section.href ? 'location' : undefined}
          >
            {section.label}
          </a>
        ))}
      </nav>
      <details className="presentation-jump-menu presentation-menu" ref={jumpMenuRef}>
        <summary>
          Jump to <ChevronDown size={16} aria-hidden="true" />
        </summary>
        <div className="presentation-menu-panel presentation-jump-panel">
          {presentationSections.map((section) => (
            <a
              key={section.href}
              href={section.href}
              aria-current={activeHref === section.href ? 'location' : undefined}
              onClick={() => closeMenu(jumpMenuRef)}
            >
              {section.label}
            </a>
          ))}
        </div>
      </details>
      <details className="presentation-share-menu presentation-menu" ref={shareMenuRef}>
        <summary aria-label="Share presentation">
          <Share2 size={17} aria-hidden="true" />
          <span className="share-label">Share</span>
          <ChevronDown className="share-chevron" size={15} aria-hidden="true" />
        </summary>
        <div className="presentation-menu-panel presentation-share-panel">
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button type="button" onClick={handleNativeShare}>
              <Share2 size={17} aria-hidden="true" />
              Share this website
            </button>
          )}
          <button type="button" onClick={handleCopyLink}>
            {copied ? <CheckCircle2 size={17} aria-hidden="true" /> : <Link2 size={17} aria-hidden="true" />}
            {copied ? 'Link copied' : 'Copy website link'}
          </button>
          <button type="button" onClick={() => window.print()}>
            <Printer size={17} aria-hidden="true" />
            Print / Save as PDF
          </button>
        </div>
      </details>
    </header>
  );
}

function WelcomeSection() {
  return (
    <section className="presentation-sheet presentation-welcome" id="welcome">
      <div className="presentation-shell welcome-layout">
        <div className="welcome-copy">
          <SectionEyebrow>Community partnership &amp; homeowner solutions</SectionEyebrow>
          <img className="welcome-logo logo-on-dark screen-only" src={lightLogo} alt="Three Doors Property Group" />
          <img className="welcome-logo print-only" src={logo} alt="Three Doors Property Group" />
          <h1>Three options.<br />One trusted partner.</h1>
          <p className="presentation-lede">
            Helping homeowners understand every available path before making one of life’s biggest financial
            decisions.
          </p>
          <div className="welcome-promise">
            <Sparkles size={22} aria-hidden="true" />
            <p>Helping homeowners. Revitalizing neighborhoods. Giving back.</p>
          </div>
          <div className="welcome-actions screen-only">
            <a className="presentation-primary" href="#doors">
              Explore the three options <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="presentation-secondary" href="#contact">
              Tell us about the property
            </a>
          </div>
        </div>
        <figure className="welcome-portrait">
          <img src={brandGraphic} alt="Matt Brown presenting the three options available to home sellers" />
          <figcaption>Matt Brown · Founder, Three Doors Property Group</figcaption>
        </figure>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="presentation-sheet presentation-light" id="about">
      <div className="presentation-shell narrow-copy">
        <SectionEyebrow>About Matt Brown</SectionEyebrow>
        <div className="about-heading">
          <h2>Leadership measured by the positive impact we leave on others.</h2>
          <p className="presentation-lede">
            Husband, father of three, educator, community leader, and real estate professional.
          </p>
        </div>
        <div className="story-grid">
          <figure className="story-headshot">
            <img src={mattHeadshot} alt="Matt Brown, founder of Three Doors Property Group" />
            <figcaption>
              <strong>Matt Brown</strong>
              <span>Founder, Three Doors Property Group</span>
            </figcaption>
          </figure>
          <div className="story-copy">
            <p>
              Matt began his career in education to be a positive male role model in as many lives as possible. He
              dedicated his career to serving students, families, and communities throughout Rhode Island, eventually
              leading public-school turnaround efforts focused on stronger outcomes for children.
            </p>
            <p>
              In 2025, he was honored as Rhode Island Principal of the Year. The recognition was meaningful, but the
              opportunity to help others grow and succeed mattered most.
            </p>
            <p>
              Today, Matt helps lead one of Rhode Island’s most successful real estate offices. He founded Three Doors
              Property Group because every property can be an opportunity to help a family, strengthen a neighborhood,
              and improve someone’s future.
            </p>
            <blockquote>
              “Every property is an opportunity to help a family, strengthen a neighborhood, and improve someone’s
              future.”
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section className="presentation-sheet presentation-purpose" id="why">
      <div className="presentation-shell">
        <SectionEyebrow>Why Three Doors exists</SectionEyebrow>
        <h2>Real-life circumstances rarely fit a one-size-fits-all solution.</h2>
        <p className="presentation-lede purpose-lede">
          Inheritance, aging parents, financial hardship, divorce, major repairs, relocation, or an unexpected life
          event can make a property decision feel overwhelming.
        </p>
        <div className="purpose-grid">
          <article>
            <p className="purpose-number">01</p>
            <h3>Our mission</h3>
            <p>
              Provide homeowners with honest guidance, multiple solutions, and compassionate service during life’s
              biggest transitions—while restoring homes, revitalizing neighborhoods, and reinvesting in the communities
              we serve.
            </p>
          </article>
          <article>
            <p className="purpose-number">02</p>
            <h3>Our vision</h3>
            <p>
              Become New England’s most trusted community-focused real estate solutions company by improving housing
              and building lasting partnerships with nonprofits, municipalities, and community organizations.
            </p>
          </article>
          <article className="purpose-principle">
            <p className="purpose-number">03</p>
            <h3>Our principle</h3>
            <p>
              Educate first. Advise honestly. Support the decision that best serves the homeowner—even when Three Doors
              is not buying the property.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function DoorsSection() {
  return (
    <section className="presentation-sheet presentation-light" id="doors">
      <div className="presentation-shell">
        <SectionEyebrow>The Three Doors model</SectionEyebrow>
        <div className="section-title-row">
          <h2>Most investors offer one solution.<br />We offer three.</h2>
          <p>
            Every property and every homeowner is different. The right path starts with understanding your goals,
            timing, property condition, and likely outcome.
          </p>
        </div>
        <div className="door-list">
          {doors.map((door) => {
            const Icon = door.icon;
            return (
              <article className="door-card" key={door.number}>
                <div className="door-icon" aria-hidden="true">
                  <Icon size={32} />
                </div>
                <div className="door-heading">
                  <p>Door {door.number}</p>
                  <h3>{door.title}</h3>
                  <span>{door.subtitle}</span>
                </div>
                <div className="door-detail">
                  <p className="best-for"><strong>Often a fit for:</strong> {door.bestFor}</p>
                  <ul>
                    {door.points.map((point) => (
                      <li key={point}><Check size={16} aria-hidden="true" /> {point}</li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
        <SectionCta label="Find the right door">
          Not sure which option fits? Start with a no-pressure property review.
        </SectionCta>
      </div>
    </section>
  );
}

function AnalysisSection() {
  return (
    <section className="presentation-sheet presentation-analysis" id="analysis">
      <div className="presentation-shell">
        <SectionEyebrow>Your personalized property review</SectionEyebrow>
        <h2>We compare the doors side by side.</h2>
        <p className="presentation-lede purpose-lede">
          The conversation is built around the property—not a predetermined sales pitch.
        </p>
        <div className="analysis-flow">
          <article>
            <span>1</span>
            <h3>Understand</h3>
            <p>Discuss your goals, timeline, property condition, and what matters most to you.</p>
          </article>
          <article>
            <span>2</span>
            <h3>Evaluate</h3>
            <p>Review the property, local market, likely preparation, timing, costs, and potential outcomes.</p>
          </article>
          <article>
            <span>3</span>
            <h3>Compare</h3>
            <p>Present the relevant options in clear language so you can weigh the tradeoffs.</p>
          </article>
          <article>
            <span>4</span>
            <h3>Choose</h3>
            <p>Move forward only when you are comfortable with the path that best serves your needs.</p>
          </article>
        </div>
        <div className="analysis-note">
          <Check size={24} aria-hidden="true" />
          <p><strong>No pressure. No assumed answer.</strong> The homeowner’s best result is the priority.</p>
        </div>
        <SectionCta label="Start your property review">
          Share the basics when you are ready. Matt will help you compare the paths clearly.
        </SectionCta>
      </div>
    </section>
  );
}

function ImpactSection() {
  return (
    <section className="presentation-sheet presentation-impact" id="impact">
      <div className="presentation-shell impact-layout">
        <div>
          <SectionEyebrow>Community impact commitment</SectionEyebrow>
          <h2>Every successful project should create impact beyond the property itself.</h2>
        </div>
        <div className="impact-amount">
          <span>$1,000</span>
          <p>planned contribution from every completed transaction to organizations supporting housing stability and
            families experiencing homelessness or housing insecurity.</p>
        </div>
        <div className="impact-list">
          <p><Check size={18} aria-hidden="true" /> Restore neglected homes and improve neighborhoods.</p>
          <p><Check size={18} aria-hidden="true" /> Support quality housing throughout our communities.</p>
          <p><Check size={18} aria-hidden="true" /> Build long-term partnerships with nonprofits and local agencies.</p>
          <p><Check size={18} aria-hidden="true" /> Treat every homeowner with dignity, honesty, and respect.</p>
        </div>
        <p className="commitment-note">
          This community commitment reflects Three Doors Property Group’s current vision. Final contribution terms and
          eligible partner organizations will be confirmed before public launch.
        </p>
      </div>
    </section>
  );
}

function PartnersSection() {
  return (
    <section className="presentation-sheet presentation-light" id="partners">
      <div className="presentation-shell">
        <SectionEyebrow>Partnering with Three Doors</SectionEyebrow>
        <div className="section-title-row">
          <h2>A trusted housing resource that provides solutions—not pressure.</h2>
          <p>
            Strong community partnerships help people navigate difficult transitions with the right expertise and
            support around them.
          </p>
        </div>
        <div className="partner-grid">
          {partnerGroups.map((group) => {
            const Icon = group.icon;
            return (
              <article key={group.label}>
                <Icon size={23} aria-hidden="true" />
                <p>{group.label}</p>
              </article>
            );
          })}
        </div>
        <div className="partner-callout">
          <HandHeart size={28} aria-hidden="true" />
          <p>
            Whether you are a homeowner, nonprofit, municipality, attorney, contractor, or community leader, the
            promise is simple: lead with integrity, provide options, restore communities, and give back.
          </p>
        </div>
        <SectionCta label="Start a conversation">
          Have a homeowner, property, or community partnership in mind? Let’s talk about the next step.
        </SectionCta>
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

function ContactSection() {
  const [submissionState, setSubmissionState] = React.useState('idle');
  const formEndpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/xbdnbawq';

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formEndpoint) {
      setSubmissionState('unavailable');
      return;
    }

    const form = event.currentTarget;
    setSubmissionState('submitting');

    try {
      const response = await fetch(formEndpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error('Submission failed');

      form.reset();
      setSubmissionState('success');
    } catch {
      setSubmissionState('error');
    }
  };

  return (
    <section className="lead-section presentation-contact screen-only" id="contact">
      <div className="section-inner lead-grid">
        <div className="lead-copy">
          <SectionEyebrow>Ready when you are</SectionEyebrow>
          <h2>Tell us what you are navigating. We will help you understand the options.</h2>
          <p>
            This is simply a starting point. There is no commitment, no assumed answer, and no pressure to move
            forward.
          </p>
          <div className="contact-highlights">
            <span><Phone size={16} aria-hidden="true" /> A personal follow-up from Matt</span>
            <span><MapPin size={16} aria-hidden="true" /> Property review before recommendations</span>
            <span><MessageSquare size={16} aria-hidden="true" /> Clear answers and practical next steps</span>
          </div>
          <div className="contact-direct">
            <a href="tel:+14014992978">401-499-2978</a>
            <a href="mailto:threedoorspropertygroup@gmail.com">threedoorspropertygroup@gmail.com</a>
          </div>
        </div>
        <div className="tally-frame">
          <form className="tally-mock" onSubmit={handleSubmit}>
            <input type="hidden" name="source" value="Three Doors website" />
            <div className="tally-header">
              <img src={logo} alt="" aria-hidden="true" />
              <h3>Start the Conversation</h3>
              <p>Share what you can. Matt will follow up to learn more and help you identify the right next step.</p>
            </div>

            <fieldset className="choice-field">
              <legend>How can we help?</legend>
              <div className="choice-grid">
                {['Homeowner or seller', 'Community partner', 'Professional referral', 'Just exploring'].map((choice) => (
                  <label key={choice}>
                    <input type="radio" name="contactType" value={choice} required />
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            </fieldset>

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

            <Field label="Property address (if applicable)">
              <input name="address" type="text" autoComplete="street-address" />
            </Field>

            <div className="tally-question-grid compact">
              <Field label="City">
                <input name="city" type="text" autoComplete="address-level2" />
              </Field>
              <Field label="State">
                <input name="state" type="text" autoComplete="address-level1" />
              </Field>
            </div>

            <fieldset className="choice-field">
              <legend>What would you like to discuss?</legend>
              <div className="choice-grid">
                {['Cash offer', 'Renovation support', 'Listing strategy', 'Community partnership', 'Not sure yet'].map((choice) => (
                  <label key={choice}>
                    <input type="radio" name="interest" value={choice} required />
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Field label="Tell us anything else we should know">
              <textarea name="message" rows="4" />
            </Field>

            <button className="button button-primary form-button" type="submit" disabled={submissionState === 'submitting'}>
              {submissionState === 'submitting' ? 'Sending...' : 'Start the Conversation'}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
            <p className="privacy-note">
              Your information will only be used to follow up about your property, partnership, or selling options.
            </p>
            {submissionState === 'success' && (
              <p className="success-message" role="status">
                Thank you. Your information has been received and Matt will follow up soon.
              </p>
            )}
            {submissionState === 'unavailable' && (
              <p className="form-status-message" role="alert">
                Online submissions are not connected yet. Please call 401-499-2978 or email
                threedoorspropertygroup@gmail.com.
              </p>
            )}
            {submissionState === 'error' && (
              <p className="form-status-message" role="alert">
                We could not send this right now. Please call 401-499-2978 or email
                threedoorspropertygroup@gmail.com.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

function NextStepsSection() {
  return (
    <section className="presentation-sheet presentation-closing" id="next-steps">
      <div className="presentation-shell closing-content">
        <img className="logo-on-dark screen-only" src={lightLogo} alt="Three Doors Property Group" />
        <img className="print-only" src={logo} alt="Three Doors Property Group" />
        <SectionEyebrow>Next steps</SectionEyebrow>
        <h2>Let’s look at the property and find the right door together.</h2>
        <p className="presentation-lede">
          Start with a conversation. We will learn about the property, understand your priorities, and explain the
          available paths clearly.
        </p>
        <div className="closing-actions screen-only">
          <a className="presentation-primary" href="#contact">
            Share the property details <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
        <div className="contact-placeholder">
          <strong>Matt Brown · Three Doors Property Group</strong>
          <a className="presentation-site-link" href={PUBLIC_SITE_URL}>3Doors.Ridge-Form.com</a>
          <a href="tel:+14014992978">401-499-2978</a>
          <a href="mailto:threedoorspropertygroup@gmail.com">threedoorspropertygroup@gmail.com</a>
          <span>Required brokerage disclosures will be added before publication.</span>
        </div>
        <p className="presentation-disclaimer">
          Any offer, renovation option, listing strategy, or contribution is subject to property review, market
          conditions, applicable agreements, and final program terms.
        </p>
      </div>
    </section>
  );
}

export default function Presentation() {
  React.useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Three Doors Property Group | Three Options For Home Sellers';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="presentation-page">
      <a className="skip-link" href="#welcome">Skip to presentation</a>
      <PresentationNav />
      <FloatingLeadCta />
      <main>
        <WelcomeSection />
        <AboutSection />
        <WhySection />
        <DoorsSection />
        <AnalysisSection />
        <ImpactSection />
        <PartnersSection />
        <NextStepsSection />
        <ContactSection />
      </main>
    </div>
  );
}
