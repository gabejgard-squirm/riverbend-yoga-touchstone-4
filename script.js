"use strict";

// These two arrays keep class content separate from the recommendation rules.
const classOptions = [
  { id: "gentle", title: "Gentle yoga", description: "An unhurried starting point for basic poses and comfortable movement." },
  { id: "vinyasa", title: "Vinyasa yoga", description: "Connect breathing and movement in a flowing class. Ask about the appropriate pace." },
  { id: "restorative", title: "Restorative yoga", description: "Choose supported resting positions and time to unwind." },
  { id: "private", title: "Private session", description: "Discuss individual goals and explore modifications with an instructor." }
];

const goalOptions = [
  { id: "start", classId: "gentle" },
  { id: "relax", classId: "restorative" },
  { id: "move", classId: "vinyasa" },
  { id: "individual", classId: "private" }
];

const experienceLevels = ["new", "some", "regular", "returning"];
const inquiryInterests = [...classOptions.map(item => item.id), "november", "december", "january"];
const contactMethods = ["email", "phone"];
const storageKey = "riverbend.touchstone4.preferences";

function defaultPreferences() {
  return { finder: { experience: "new", goal: "start" }, inquiry: {} };
}

// Storage may be unavailable or contain an older/invalid value. Use safe defaults.
function loadPreferences() {
  const clean = defaultPreferences();
  let restored = false;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && typeof saved === "object") {
      if (experienceLevels.includes(saved.finder?.experience)) {
        clean.finder.experience = saved.finder.experience;
        restored = true;
      }
      if (goalOptions.some(item => item.id === saved.finder?.goal)) {
        clean.finder.goal = saved.finder.goal;
        restored = true;
      }
      if (inquiryInterests.includes(saved.inquiry?.interest)) clean.inquiry.interest = saved.inquiry.interest;
      if (experienceLevels.includes(saved.inquiry?.experience)) clean.inquiry.experience = saved.inquiry.experience;
      if (contactMethods.includes(saved.inquiry?.contactMethod)) clean.inquiry.contactMethod = saved.inquiry.contactMethod;
    }
  } catch (error) {
    // Invalid JSON and denied storage must not disable the form or class finder.
  }
  return { preferences: clean, restored };
}

let { preferences, restored } = loadPreferences();

function savePreferences() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
    return true;
  } catch (error) {
    return false;
  }
}

function recommendClass(experience, goal) {
  const choice = goalOptions.find(item => item.id === goal) || goalOptions[0];
  // Do not suggest the flowing class as the first step for a new/returning student.
  const classId = goal === "move" && ["new", "returning"].includes(experience)
    ? "gentle" : choice.classId;
  return classOptions.find(item => item.id === classId);
}

function showRecommendation(experience, goal) {
  const result = document.getElementById("class-result");
  const recommendation = recommendClass(experience, goal);
  result.replaceChildren();
  const heading = document.createElement("h3");
  heading.textContent = `Suggested starting point: ${recommendation.title}`;
  const description = document.createElement("p");
  description.textContent = recommendation.description;
  if (goal === "move" && ["new", "returning"].includes(experience)) {
    description.textContent += " Start gently, then ask your instructor about moving into vinyasa.";
  }
  const link = document.createElement("a");
  link.href = `events.html?interest=${encodeURIComponent(recommendation.id)}&experience=${encodeURIComponent(experience)}#interest-form`;
  link.textContent = `Ask about ${recommendation.title.toLowerCase()}`;
  result.append(heading, description, link);
}

function setupClassFinder() {
  const form = document.getElementById("class-finder");
  if (!form) return;
  const experience = document.getElementById("finder-experience");
  const goal = document.getElementById("finder-goal");
  const status = document.getElementById("preference-status");
  experience.value = preferences.finder.experience;
  goal.value = preferences.finder.goal;
  if (restored) {
    showRecommendation(experience.value, goal.value);
    status.textContent = "Your saved experience and goal have been restored.";
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    preferences.finder = { experience: experience.value, goal: goal.value };
    showRecommendation(experience.value, goal.value);
    status.textContent = savePreferences()
      ? "Your experience and goal are saved on this browser for your next visit."
      : "Your suggestion is ready. Browser storage is unavailable, so choices could not be saved.";
  });
  document.getElementById("forget-preferences").addEventListener("click", () => {
    preferences = defaultPreferences();
    restored = false;
    let cleared = true;
    try { localStorage.removeItem(storageKey); } catch (error) { cleared = false; }
    form.reset();
    // reset() restores HTML defaults; saved values were assigned only as properties.
    experience.value = "new";
    goal.value = "start";
    document.getElementById("class-result").replaceChildren();
    status.textContent = cleared ? "Saved choices cleared." : "Choices reset here. Browser storage could not be cleared.";
  });
}

function setFieldError(id, message) {
  const field = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);
  error.textContent = message;
  error.hidden = !message;
  if (message) field.setAttribute("aria-invalid", "true");
  else field.removeAttribute("aria-invalid");
}

function validateInquiry(form) {
  const errors = {};
  const fields = form.elements;
  const name = fields.namedItem("name").value.trim();
  const email = fields.namedItem("email").value.trim();
  const phone = fields.namedItem("phone").value.trim();
  const message = fields.namedItem("message").value.trim();
  if (name.length < 2 || name.length > 80) errors.name = "Enter your name using 2 to 80 characters.";
  if (!email || email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address, such as name@example.com.";
  }
  const contact = fields.namedItem("contact_method").value;
  if (!contactMethods.includes(contact)) errors["contact-method"] = "Choose how you would like us to contact you.";
  if (contact === "phone" && !phone) errors.phone = "Enter a phone number when requesting a phone reply.";
  else if (phone && (!/^[+]?[0-9 ]{7,20}$/.test(phone) || phone.replace(/\D/g, "").length < 7)) {
    errors.phone = "Enter at least 7 digits, using only digits, spaces, and an optional leading +.";
  }
  if (!inquiryInterests.includes(fields.namedItem("interest").value)) errors.interest = "Choose a class or workshop.";
  if (!experienceLevels.includes(fields.namedItem("experience").value)) errors.experience = "Choose your experience level.";
  if (message.length < 10 || message.length > 1000) errors.message = "Enter a message between 10 and 1000 characters (not just spaces).";
  return errors;
}

function rememberInquiry(form) {
  preferences.inquiry = {
    interest: form.elements.namedItem("interest").value,
    experience: form.elements.namedItem("experience").value,
    contactMethod: form.elements.namedItem("contact_method").value
  };
  return savePreferences();
}

function setupInquiry() {
  const form = document.getElementById("interest-form");
  if (!form) return;
  // JS displays all errors together; HTML validation remains available without JS.
  form.noValidate = true;
  const summary = document.getElementById("form-summary");
  const status = document.getElementById("inquiry-preferences");
  const params = new URLSearchParams(location.search);
  const supplied = { interest: params.get("interest"), experience: params.get("experience") };
  const values = { ...preferences.inquiry };
  if (inquiryInterests.includes(supplied.interest)) values.interest = supplied.interest;
  if (experienceLevels.includes(supplied.experience)) values.experience = supplied.experience;
  for (const [id, key] of [["interest", "interest"], ["experience", "experience"], ["contact-method", "contactMethod"]]) {
    if (values[key]) document.getElementById(id).value = values[key];
  }
  if (inquiryInterests.includes(supplied.interest)) {
    status.textContent = "Your class finder selection is filled in below. You can change it.";
  } else if (Object.keys(preferences.inquiry).length) {
    status.textContent = "Your saved inquiry preferences have been restored. Contact details and messages are not saved.";
  }
  const ids = ["name", "email", "phone", "contact-method", "interest", "experience", "message"];
  function clearFeedback() {
    ids.forEach(id => setFieldError(id, ""));
    summary.hidden = true;
    summary.textContent = "";
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    clearFeedback();
    const errors = validateInquiry(form);
    if (Object.keys(errors).length) {
      for (const [id, message] of Object.entries(errors)) setFieldError(id, message);
      summary.textContent = "Please correct the fields marked below. Your entries have been kept.";
      summary.hidden = false;
      summary.focus();
      return;
    }
    const saved = rememberInquiry(form);
    summary.textContent = "Your inquiry is ready. This class project does not send messages or reserve places. " +
      (saved ? "Your class, experience, and contact preference are saved for your next visit." : "Browser storage is unavailable, so preferences could not be saved.");
    summary.hidden = false;
    summary.focus();
  });
  for (const id of ["interest", "experience", "contact-method"]) {
    document.getElementById(id).addEventListener("change", () => {
      status.textContent = rememberInquiry(form)
        ? "Class, experience, and contact preferences saved on this browser. Contact details and messages are not saved."
        : "Browser storage is unavailable. You can still complete the form.";
      summary.hidden = true;
    });
  }
  form.addEventListener("input", () => {
    // A previous ready-to-send result must not remain visible after editing.
    summary.hidden = true;
  });
  form.addEventListener("reset", () => {
    clearFeedback();
    preferences.inquiry = {};
    const saved = savePreferences();
    status.textContent = saved ? "Inquiry fields and saved inquiry preferences cleared." : "Inquiry fields cleared. Browser storage could not be updated.";
  });
}

setupClassFinder();
setupInquiry();
