export interface ParsedAddress {
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Parses complex raw shipping address strings into structured recipient name, phone, address label, and street lines.
 * Example raw string: "[Home] god groot (Phone: 9973884720) - d1 dayalpura bhajanpura"
 */
export function parseAddress(shippingAddress: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}): ParsedAddress {
  const rawStreet = shippingAddress?.street || "";
  let label = "Home";
  let name = "";
  let phone = "";
  let street = rawStreet;

  // Extract bracket label e.g., "[Home]" or "[Work]"
  const labelMatch = street.match(/^\[(.*?)\]\s*/);
  if (labelMatch) {
    label = labelMatch[1].trim();
    street = street.replace(labelMatch[0], "").trim();
  }

  // Extract Name (Phone: XXXXX) - Street
  const phoneMatch = street.match(/^(.*?)\s*\(Phone:\s*([^)]+)\)\s*-\s*(.*)$/i);
  if (phoneMatch) {
    name = phoneMatch[1].trim();
    phone = phoneMatch[2].trim();
    street = phoneMatch[3].trim();
  } else {
    // Fallback: search for (Phone: XXXXX) anywhere in the street string
    const phoneOnlyMatch = street.match(/\(Phone:\s*([^)]+)\)/i);
    if (phoneOnlyMatch) {
      phone = phoneOnlyMatch[1].trim();
      street = street.replace(phoneOnlyMatch[0], "").replace(/^-\s*/, "").trim();
    }
  }

  // Capitalize name & label nicely
  const formattedLabel = label ? label.charAt(0).toUpperCase() + label.slice(1) : "Home";
  const formattedPhone = phone ? (phone.startsWith("+") ? phone : `+91 ${phone}`) : "";
  const formattedName = name || "Customer";

  return {
    label: formattedLabel,
    name: formattedName,
    phone: formattedPhone,
    street: street || rawStreet,
    city: shippingAddress?.city || "",
    state: shippingAddress?.state || "",
    zipCode: shippingAddress?.zipCode || "",
    country: shippingAddress?.country || "India",
  };
}
