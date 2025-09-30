export function getUserInfoFromToken(token) {
	if (!token) return null;
	try {
		const payload = token.split(".")[1];
		const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
		const decodedPayload = JSON.parse(atob(base64));

		// Log the entire payload (optional for debugging)
		//console.log("Decoded Token Payload:", decodedPayload);

		// Return all user-related fields from the token
		return {
			id: decodedPayload.user_id || decodedPayload.id || null,
			username: decodedPayload.username || null,
			email: decodedPayload.email || null,
			first_name: decodedPayload.first_name || null,
			last_name: decodedPayload.last_name || null,
			...decodedPayload, // optional: include everything else
		};
	} catch (e) {
		console.error("Failed to decode token", e);
		return null;
	}
}
