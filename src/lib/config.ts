/**
 * Single source of truth for all Clash of Coders 3.0 content.
 * Swap real content here — components never hardcode copy.
 */

export type CountdownMode = "registration" | "hackathonStart";

export const COUNTDOWN_TARGET_MODE = "hackathonStart" as CountdownMode;

// IST = UTC+5:30
export const DATES = {
  // TODO: replace placeholder — registration deadline is still TBD.
  registrationDeadline: "2026-08-15T23:59:00+05:30",
  hackathonStart: "2026-08-22T09:00:00+05:30",
  hackathonEnd: "2026-08-23T18:00:00+05:30",
  displayRange: "22–23 August 2026",
};

export const countdownTarget = () =>
  new Date(
    COUNTDOWN_TARGET_MODE === "registration"
      ? DATES.registrationDeadline
      : DATES.hackathonStart,
  );

export const EVENT = {
  name: "Clash of Coders 3.0",
  tagline: "A 24-hour hackathon by Hacker's Unity × JECRC Foundation",
  hashtag: "#ClashOfCoders3",
  venueName: "JECRC Foundation, Jaipur",
  venueAddress:
    "Plot No. IS-2036 to IS-2039, Ramchandrapura Industrial Area, Vidhani, Sitapura Extension, Jaipur, Rajasthan 303905",
  about:
    "Get ready for Clash of Coders 3.0, a 24-hour hackathon organized by Hacker's Unity × JECRC Foundation. Bring your ideas to life, solve real-world problems, and collaborate with passionate innovators. Enjoy mentorship, networking, workshops, exciting prizes, swags, internship opportunities, and certificates while competing with the best minds.",
};

export const LINKS = {
  // TODO: replace placeholder — external registration form URL.
  register: "#",
  // TODO: replace placeholders — real social handles.
  instagram: "#",
  linkedin: "#",
  discord: "#",
  whatsapp: "#",
  email: "hello@hackersunity.example",
};

export const MAP = {
  embedSrc: `https://www.google.com/maps?q=${encodeURIComponent(
    "JECRC Foundation, Sitapura Extension, Jaipur, Rajasthan 303905",
  )}&output=embed`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    "JECRC Foundation, Ramchandrapura Industrial Area, Vidhani, Sitapura Extension, Jaipur, Rajasthan 303905",
  )}`,
};

export const STATS = [
  { label: "Prize Pool", value: 200000, prefix: "₹", format: "inr" as const },
  { label: "Top 3 Teams", value: 50000, prefix: "Up to ₹", format: "inr" as const },
  { label: "Participants", value: 600, suffix: "+" },
  { label: "Mentors", value: 15, suffix: "+" },
  { label: "Judges", value: 6, suffix: "+" },
  { label: "Tracks", value: 10, suffix: "+" },
  { label: "Duration", value: 24, suffix: " hrs" },
];

// TODO: replace placeholder one-liners with final track briefs.
export const TRACKS = [
  { name: "Artificial Intelligence", short: "AI", desc: "Build intelligent systems that learn, predict and adapt." },
  { name: "Web Development", short: "Web", desc: "Ship fast, accessible products for the open web." },
  { name: "Cybersecurity", short: "Sec", desc: "Defend systems, break assumptions, patch the gaps." },
  { name: "Blockchain & Web3", short: "Web3", desc: "Trustless apps, on-chain ownership and open protocols." },
  { name: "Healthcare", short: "Health", desc: "Tech that improves diagnosis, access and patient care." },
  { name: "FinTech", short: "Fin", desc: "Reinvent payments, lending and financial inclusion." },
  { name: "EdTech", short: "Edu", desc: "Make learning personal, measurable and reachable." },
  { name: "Sustainability", short: "Green", desc: "Climate, energy and resource solutions that scale." },
  { name: "Open Innovation", short: "Open", desc: "No brief, no limits — solve a problem you care about." },
  { name: "IoT & Robotics", short: "IoT", desc: "Connect the physical world to intelligent software." },
];

// TODO: replace placeholder times with the confirmed run-of-show.
export const TIMELINE = [
  {
    day: "Day 1",
    date: "22 August",
    items: [
      { time: "09:00", title: "Registration & Check-in" },
      { time: "10:30", title: "Opening Ceremony" },
      { time: "11:30", title: "Problem Statement Reveal" },
      { time: "12:15", title: "Team Networking" },
      { time: "13:00", title: "Hacking Begins" },
      { time: "16:00", title: "Mentor Sessions" },
      { time: "20:00", title: "Dinner" },
      { time: "22:00", title: "Overnight Coding" },
    ],
  },
  {
    day: "Day 2",
    date: "23 August",
    items: [
      { time: "08:00", title: "Breakfast" },
      { time: "10:00", title: "Project Submission" },
      { time: "11:00", title: "Judging" },
      { time: "13:00", title: "Lunch" },
      { time: "14:30", title: "Final Presentations" },
      { time: "17:00", title: "Closing Ceremony & Prize Distribution" },
    ],
  },
];

export const PRIZES = {
  total: "₹2,00,000",
  highlights: [
    { title: "Top 3 Teams", detail: "Up to ₹50,000" },
    { title: "Track Prizes & Special Awards", detail: "TBA" },
    { title: "Swags & Goodies", detail: "For winners and standout builds" },
    { title: "Internship Opportunities", detail: "With partner companies" },
    { title: "Certificates", detail: "For all participants" },
  ],
};

// TODO: replace placeholder headshots with real photos.
export const GUESTS = [
  { name: "Dr. Arjun Mehta", role: "AI Research Lead" },
  { name: "Priya Sharma", role: "Senior Software Engineer" },
  { name: "Rahul Verma", role: "Startup Founder & CTO" },
  { name: "Neha Kapoor", role: "Cybersecurity Expert" },
  { name: "Amit Singh", role: "Keynote Speaker" },
  { name: "Ananya Rao", role: "Innovation Mentor" },
];

// TODO: replace placeholder wordmarks with real sponsor logos.
export const SPONSORS = [
  { tier: "Title Sponsor", name: "TechNova" },
  { tier: "Gold Sponsor", name: "CloudSphere" },
  { tier: "Silver Sponsor", name: "CodeCraft" },
  { tier: "Community Partner", name: "DevConnect" },
  { tier: "Cloud Partner", name: "SkyCompute" },
  { tier: "Swag Partner", name: "SwagBox" },
];

// TODO: replace placeholder answers once the organising team confirms policy.
export const FAQS = [
  {
    q: "Who can participate?",
    a: "Clash of Coders 3.0 is open to all students — school, undergraduate and postgraduate — from any institution. Bring a valid student ID to check-in.",
  },
  {
    q: "Is there a registration fee?",
    a: "No. Registration is completely free, and that includes meals, refreshments and swag through the 24 hours.",
  },
  {
    q: "Can I participate individually?",
    a: "Yes. Solo entries are welcome, and we run a team-networking block right after the problem statement reveal so you can find teammates on the spot.",
  },
  {
    q: "What is the maximum team size?",
    a: "Teams can have up to 4 members. Cross-college and cross-discipline teams are allowed and encouraged.",
  },
];

export const NAV_SECTIONS = [
  { id: "about", label: "About" },
  { id: "hall-of-fame", label: "Hall of Fame" },
  { id: "tracks", label: "Tracks" },
  { id: "timeline", label: "Timeline" },
  { id: "prizes", label: "Prizes" },
  { id: "guests", label: "Guests" },
  { id: "sponsors", label: "Sponsors" },
  { id: "faq", label: "FAQs" },
  { id: "venue", label: "Venue" },
];