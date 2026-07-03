export const detectCategory = (
  title,
  description
) => {

  const text =
   `${title} ${description}`.toLowerCase();

  // Sanitation
  if (
    text.includes("garbage") ||
    text.includes("trash") ||
    text.includes("waste") ||
    text.includes("dirty")
  ) {
    return "Sanitation";
  }

  // Water
  if (
    text.includes("water") ||
    text.includes("pipe") ||
    text.includes("leakage") ||
    text.includes("drain")
  ) {
    return "Water";
  }

  // Electricity
  if (
    text.includes("light") ||
    text.includes("electricity") ||
    text.includes("street light") ||
    text.includes("power")
  ) {
    return "Electricity";
  }

  // Road
  if (
    text.includes("road") ||
    text.includes("pothole") ||
    text.includes("street damage")
  ) {
    return "Road";
  }

  // Traffic
  if (
    text.includes("traffic") ||
    text.includes("parking") ||
    text.includes("vehicle")
  ) {
    return "Traffic";
  }

  return "Other";
};