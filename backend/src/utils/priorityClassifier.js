export const detectPriority = (
  title,
  description
) => {

  const text =
   `${title} ${description}`.toLowerCase();

  // URGENT
  if (
    text.includes("fire") ||
    text.includes("sparking") ||
    text.includes("electric shock") ||
    text.includes("accident") ||
    text.includes("collapsed") ||
    text.includes("emergency")
  ) {
    return "Urgent";
  }

  // HIGH
  if (
    text.includes("water leakage") ||
    text.includes("huge pothole") ||
    text.includes("broken road") ||
    text.includes("overflow") ||
    text.includes("danger")
  ) {
    return "High";
  }

  // MEDIUM
  if (
    text.includes("garbage") ||
    text.includes("street light") ||
    text.includes("dirty")
  ) {
    return "Medium";
  }

  return "Low";
};