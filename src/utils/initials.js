// Two letters for an avatar: "Atiq Ullah" → "AU", "Atiq" → "AT"
export const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
};
