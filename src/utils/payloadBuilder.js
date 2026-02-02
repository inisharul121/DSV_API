// Utility to map simplified frontend data to DSV API v2 Structure

exports.buildBookingPayload = (data) => {
    // Default to a test scenario structure
    return {
        autobook: false, // Draft mode by default
        product: {
            name: "Road" // Defaulting to Road for verification
        },
        incoterms: {
            code: "DAP",
            location: data.destination?.country || "City"
        },
        parties: {
            sender: {
                address: {
                    companyName: "Test Sender Ltd",
                    addressLine1: "Industrial Park 1",
                    city: "Copenhagen",
                    countryCode: data.origin?.country || "DK",
                    zipCode: "2600"
                },
                contact: {
                    name: "Dispatcher",
                    email: "sender@example.com"
                }
            },
            receiver: {
                address: {
                    companyName: "Test Receiver GmbH",
                    addressLine1: "Business Str 10",
                    city: "Berlin",
                    countryCode: data.destination?.country || "DE",
                    zipCode: "10115"
                },
                contact: {
                    name: "Receiver",
                    email: "receiver@example.com"
                }
            },
            // Required for Road bookings
            freightPayer: {
                address: {
                    countryCode: data.origin?.country || "DK"
                }
            },
            bookingParty: {
                address: {
                    countryCode: data.origin?.country || "DK"
                }
            }
        },
        packages: [
            {
                quantity: 1,
                packageType: "CTN", // Carton
                totalWeight: parseFloat(data.parcels?.[0]?.weight || 10),
                description: data.commodity || "General Cargo",
                stackable: "NO"
            }
        ],
        units: {
            dimension: "CM",
            weight: "KG",
            volume: "M3",
            loadingSpace: "LM",
            temperature: "C"
        }
    };
};
