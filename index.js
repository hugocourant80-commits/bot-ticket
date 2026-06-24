require("dotenv").config();

const STAFF_ROLE = "1519293827762884638";
const TICKET_CATEGORY = "1519294600651608104";
const PANEL_CHANNEL = "1519294465435631729";
const LOG_CHANNEL = "1519294500118331432";

const claimedBy = {};
const ticketOwners = {};
const ticketReasons = {};
const closedTickets = {};

const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    EmbedBuilder
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("clientReady", () => {
    console.log(`${client.user.tag} connecté !`);
});

// ================= FORMULAIRES =================

const forms = {

    Deban: `# 🔓 Formulaire de Demande de Deban

## 👤 Informations du joueur
- Pseudo Roblox :
- ID Roblox :
- Pseudo Discord :
- ID Discord :

## 🚫 Informations du bannissement
- Date du ban :
- Staff ayant mis le ban :
- Raison du bannissement :
- Durée du ban :
- Ban Discord / Jeu :

## 📝 Explications
- Pourquoi avez-vous été banni selon vous ?
- Pensez-vous que le ban était justifié ?
- Expliquez votre version des faits :

## 🙏 Demande de deban
- Pourquoi devrions-nous vous débannir ?

## 📸 Preuves
- Screenshots :
- Vidéos :
`,

    Partenariat: `# 🤝 Formulaire de Demande Partenariat

- Nom du serveur :
- Fondateur :
- Nombre de membres :
- Date de création :

- Décrivez votre serveur :
- Vos activités :

- Pourquoi ce partenariat ?
- Qu'apporterez-vous ?

- Réseaux sociaux :
- Informations supplémentaires :
`,

    "Demande RP": `# 🏢 Formulaire Création d’Entreprise

🏷️ Nom de l’entreprise :

🛠️ Activité :

📍 Adresse :

📞 Téléphone :

👤 Nom / Prénom :

🎂 Âge :

📝 Description :
`,

    Animation: `🎉 DEMANDE D'ÉVÈNEMENT

Pseudo Discord :

Nom de l’évènement :

Date :

Heure :

Durée :

Type :

Présentation :

Activités prévues :

Nombre de participants :

Besoins particuliers :
`,

    "Report Joueur": `# 🎮 Formulaire Report Joueur

Pseudo Roblox :

ID Roblox :

Pseudo Discord :

Nom du joueur :

Date :

Que fait le joueur ?

Type :
- Freekill
- Troll
- Insultes
- Cheat

Preuves :
`,

    "Report Staff": `# 📋 Formulaire Report Staff

Pseudo Roblox :

Pseudo Discord :

Nom du staff :

Grade :

Date :

Explication :

Preuves :

Raison :
- Abus de pouvoir
- Manque de respect
- Troll
- Favoritisme
`
};

client.on("interactionCreate", async interaction => {
        // ================= CRÉATION DU TICKET =================

    if (
        interaction.isStringSelectMenu() &&
        interaction.customId === "ticket_menu"
    ) {

        const raison = interaction.values[0];

        const dejaOuvert =
            interaction.guild.channels.cache.find(
                c =>
                    c.parentId === TICKET_CATEGORY &&
                    c.topic === interaction.user.id
            );

        if (dejaOuvert) {
            return interaction.reply({
                content: `❌ Tu as déjà un ticket ouvert : ${dejaOuvert}`,
                ephemeral: true
            });
        }

        let ticketName;

        switch (raison) {
            case "Partenariat":
                ticketName = `🤝・${interaction.user.username}`;
                break;

            case "Demande RP":
                ticketName = `🏢・${interaction.user.username}`;
                break;

            case "Animation":
                ticketName = `🎭・${interaction.user.username}`;
                break;

            case "Fondation":
                ticketName = `☎️・${interaction.user.username}`;
                break;

            case "Report Joueur":
                ticketName = `⚠️・${interaction.user.username}`;
                break;

            case "Report Staff":
                ticketName = `🛡️・${interaction.user.username}`;
                break;

            case "Deban":
                ticketName = `🔓・${interaction.user.username}`;
                break;

            case "Recrutement":
                ticketName = `👮・${interaction.user.username}`;
                break;

            default:
                ticketName = `❓・${interaction.user.username}`;
        }

        const channel =
            await interaction.guild.channels.create({
                name: ticketName,
                type: ChannelType.GuildText,
                parent: TICKET_CATEGORY,
                topic: interaction.user.id,

                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [
                            PermissionsBitField.Flags.ViewChannel
                        ]
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages
                        ]
                    },
                    {
                        id: STAFF_ROLE,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages
                        ]
                    }
                ]
            });

        ticketOwners[channel.id] =
            interaction.user.id;

        ticketReasons[channel.id] =
            raison;

        closedTickets[channel.id] =
            false;

        const buttons =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("claim")
                        .setLabel("🎫 Claim")
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId("close")
                        .setLabel("🔒 Fermer")
                        .setStyle(ButtonStyle.Danger)
                );

        const embed =
            new EmbedBuilder()
                .setColor("#00ff66")
                .setTitle("🎫 Ticket Martinique RP")
                .setDescription(
                    `Bienvenue ${interaction.user}

📁 Raison : **${raison}**

👮 Un membre du staff prendra votre ticket en charge.

📝 Merci de décrire votre demande.

📌 Commandes Staff :

• !add @membre
• !remove @membre
• !rename nom`
                )
                .setFooter({
                    text: "Martinique RP"
                })
                .setTimestamp();

        await channel.send({
            content: `<@&${STAFF_ROLE}>`,
            embeds: [embed],
            components: [buttons]
        });

        if (forms[raison]) {
            await channel.send(forms[raison]);
        }

        await interaction.reply({
            content: `✅ Ton ticket a été créé : ${channel}`,
            ephemeral: true
        });
    }
        // ================= CLAIM =================

    if (
        interaction.isButton() &&
        interaction.customId === "claim"
    ) {

        if (
            !interaction.member.roles.cache.has(
                STAFF_ROLE
            )
        ) {
            return interaction.reply({
                content: "❌ Seul le staff peut claim un ticket.",
                ephemeral: true
            });
        }

        if (claimedBy[interaction.channel.id]) {
            return interaction.reply({
                content: `❌ Ce ticket est déjà claim par <@${claimedBy[interaction.channel.id]}>.`,
                ephemeral: true
            });
        }

        claimedBy[interaction.channel.id] =
            interaction.user.id;

        return interaction.reply(
            `🎫 ${interaction.user} a pris ce ticket en charge.`
        );
    }

    // ================= FERMER =================

    if (
        interaction.isButton() &&
        interaction.customId === "close"
    ) {

        const owner =
            ticketOwners[interaction.channel.id];

        const isOwner =
            interaction.user.id === owner;

        const isStaff =
            interaction.member.roles.cache.has(
                STAFF_ROLE
            );

        if (!isOwner && !isStaff) {
            return interaction.reply({
                content:
                    "❌ Tu ne peux pas fermer ce ticket.",
                ephemeral: true
            });
        }

        closedTickets[
            interaction.channel.id
        ] = true;

        await interaction.channel.permissionOverwrites.edit(
            owner,
            {
                SendMessages: false
            }
        );

        const closeButtons =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("reopen")
                        .setLabel("🔓 Réouvrir")
                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()
                        .setCustomId("delete")
                        .setLabel("🗑️ Supprimer")
                        .setStyle(
                            ButtonStyle.Danger
                        )
                );

        return interaction.reply({
            content:
                "🔒 Le ticket a été fermé.\n\nLe créateur ne peut plus parler.",
            components: [closeButtons]
        });
    }

    // ================= RÉOUVRIR =================

    if (
        interaction.isButton() &&
        interaction.customId === "reopen"
    ) {

        const owner =
            ticketOwners[interaction.channel.id];

        const isOwner =
            interaction.user.id === owner;

        const isStaff =
            interaction.member.roles.cache.has(
                STAFF_ROLE
            );

        if (!isOwner && !isStaff) {
            return interaction.reply({
                content:
                    "❌ Tu ne peux pas réouvrir ce ticket.",
                ephemeral: true
            });
        }

        closedTickets[
            interaction.channel.id
        ] = false;

        await interaction.channel.permissionOverwrites.edit(
            owner,
            {
                SendMessages: true
            }
        );

        return interaction.reply(
            "🔓 Le ticket a été réouvert."
        );
    }

    // ================= SUPPRIMER =================

    if (
        interaction.isButton() &&
        interaction.customId === "delete"
    ) {

        if (
            !interaction.member.roles.cache.has(
                STAFF_ROLE
            )
        ) {
            return interaction.reply({
                content:
                    "❌ Seul le staff peut supprimer un ticket.",
                ephemeral: true
            });
        }

        const confirmRow =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            "confirm_delete"
                        )
                        .setLabel("✅ Confirmer")
                        .setStyle(
                            ButtonStyle.Danger
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "cancel_delete"
                        )
                        .setLabel("❌ Annuler")
                        .setStyle(
                            ButtonStyle.Secondary
                        )
                );

        return interaction.reply({
            content:
                "⚠️ Confirmer la suppression du ticket ?",
            components: [confirmRow],
            ephemeral: true
        });
    }

    // ================= ANNULER =================

    if (
        interaction.isButton() &&
        interaction.customId === "cancel_delete"
    ) {

        return interaction.reply({
            content:
                "❌ Suppression annulée.",
            ephemeral: true
        });
    }

    // ================= CONFIRMER =================

    if (
        interaction.isButton() &&
        interaction.customId === "confirm_delete"
    ) {

        const logs =
            interaction.guild.channels.cache.get(
                LOG_CHANNEL
            );

        if (logs) {

            const logEmbed =
                new EmbedBuilder()
                    .setColor("Red")
                    .setTitle(
                        "📜 Ticket supprimé"
                    )
                    .addFields(
                        {
                            name: "👤 Utilisateur",
                            value:
                                `<@${ticketOwners[interaction.channel.id]}>`
                        },
                        {
                            name: "📁 Raison",
                            value:
                                ticketReasons[interaction.channel.id]
                        },
                        {
                            name: "🎫 Claim",
                            value:
                                claimedBy[interaction.channel.id]
                                    ? `<@${claimedBy[interaction.channel.id]}>`
                                    : "Aucun"
                        },
                        {
                            name: "🗑️ Supprimé par",
                            value:
                                `${interaction.user}`
                        }
                    )
                    .setTimestamp();

            logs.send({
                embeds: [logEmbed]
            });
        }

        delete claimedBy[
            interaction.channel.id
        ];

        delete ticketOwners[
            interaction.channel.id
        ];

        delete ticketReasons[
            interaction.channel.id
        ];

        delete closedTickets[
            interaction.channel.id
        ];

        await interaction.reply(
            "🗑️ Suppression du ticket dans 3 secondes..."
        );

        setTimeout(async () => {
            await interaction.channel.delete();
        }, 3000);
    }
});

client.on("messageCreate", async message => {

    console.log("Message reçu :", message.content);

    if (message.author.bot) return;
        // ================= !PANEL =================

    if (
        message.content === "!panel" &&
        message.channel.id === PANEL_CHANNEL
    ) {

        const embed = new EmbedBuilder()
            .setColor("#2ECC71")
            .setTitle("🎫 Ticket Martinique RP")
            .setDescription(`
Bienvenue dans les tickets de **Martinique RP** ✨

Nos staffs sont disponibles pour vous aider.

**Motifs disponibles :**

🤝 Demande Partenariat

🏢 Demande RP
↳ Création d'entreprise

🎭 Proposition d'animation

☎️ Contactez la Fondation

⚠️ Report Joueur

🛡️ Report Staff

🔓 Demande Deban

👮 Recrutement Staff

❓ Autres

Sélectionnez la catégorie correspondant à votre demande.
`)
            .setFooter({
                text: "Martinique RP • Support"
            })
            .setTimestamp();

        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_menu")
            .setPlaceholder("Choisissez une raison")
            .addOptions([
                {
                    label: "Demande Partenariat",
                    value: "Partenariat",
                    emoji: "🤝"
                },
                {
                    label: "Demande RP",
                    value: "Demande RP",
                    emoji: "🏢"
                },
                {
                    label: "Proposition d'animation",
                    value: "Animation",
                    emoji: "🎭"
                },
                {
                    label: "Contactez la Fondation",
                    value: "Fondation",
                    emoji: "☎️"
                },
                {
                    label: "Report Joueur",
                    value: "Report Joueur",
                    emoji: "⚠️"
                },
                {
                    label: "Report Staff",
                    value: "Report Staff",
                    emoji: "🛡️"
                },
                {
                    label: "Demande Deban",
                    value: "Deban",
                    emoji: "🔓"
                },
                {
                    label: "Recrutement Staff",
                    value: "Recrutement",
                    emoji: "👮"
                },
                {
                    label: "Autres",
                    value: "Autres",
                    emoji: "❓"
                }
            ]);

        const row =
            new ActionRowBuilder()
                .addComponents(menu);

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }

    // ================= !ADD =================

    if (message.content.startsWith("!add")) {

        if (
            !message.member.roles.cache.has(
                STAFF_ROLE
            )
        ) return;

        const membre =
            message.mentions.members.first();

        if (!membre) {
            return message.reply(
                "❌ Mentionne un membre."
            );
        }

        await message.channel.permissionOverwrites.edit(
            membre.id,
            {
                ViewChannel: true,
                SendMessages: true
            }
        );

        message.channel.send(
            `✅ ${membre} a été ajouté au ticket.`
        );
    }

    // ================= !REMOVE =================

    if (message.content.startsWith("!remove")) {

        if (
            !message.member.roles.cache.has(
                STAFF_ROLE
            )
        ) return;

        const membre =
            message.mentions.members.first();

        if (!membre) {
            return message.reply(
                "❌ Mentionne un membre."
            );
        }

        await message.channel.permissionOverwrites.delete(
            membre.id
        );

        message.channel.send(
            `❌ ${membre} a été retiré du ticket.`
        );
    }

    // ================= !RENAME =================

    if (message.content.startsWith("!rename")) {

        if (
            !message.member.roles.cache.has(
                STAFF_ROLE
            )
        ) return;

        const args =
            message.content.split(" ").slice(1);

        const nouveauNom =
            args.join("-");

        if (!nouveauNom) {
            return message.reply(
                "❌ Donne un nouveau nom."
            );
        }

        await message.channel.setName(
            nouveauNom
        );

        message.channel.send(
            `✏️ Ticket renommé en : ${nouveauNom}`
        );
    }
});

const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Bot en ligne !");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Serveur web démarré.");
});

client.login(process.env.TOKEN);