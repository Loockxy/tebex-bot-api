module.exports = {
    bot: {
        token: "", // Token du bot
        clientId: '', // ID du bot
        guildId: '', // ID du serveur discord
        status: 'Merki Loockxy ❤️', // Status du bot
        owners: ['503306000187523084'] // Owners du bot Exemple : owners: ['503306000187523084', '503306000187523084', ...]
    },
    mongodb: "mongodb+srv://", // Lien de connection a MongoDB
    api: {
        secret: '', // ID Secret du endpoint tebex (Integrations > Webhooks)
        port: 80, // Port du endpoint
        client: '', // Role clients
        products: { // Role spécifier au produit
            [0]: "", // [ID du produit]: "ID du role"
        },
        channels: {
            logs: '', // ID du salon des Logs 
        }
    },
};