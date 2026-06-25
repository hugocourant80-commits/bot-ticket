require("dotenv").config();

const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Bot en ligne");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Serveur web démarré.");
});

const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    ChannelType,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const STAFF_ROLE = "1519293827762884638";
const TICKET_CATEGORY = "1519294600651608104";
const PANEL_CHANNEL = "1519294465435631729";
const LOG_CHANNEL = "1519294500118331432";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

client.once("clientReady", () => {
    console.log(`${client.user.tag} connecté !`);
});
client.on("messageCreate", async message => {

    if (message.author.bot) return;

    if (
        message.content === "!panel" &&
        message.channel.id === PANEL_CHANNEL
    ) {

        const embed = new EmbedBuilder()
            .setColor("#2ECC71")
            .setTitle("🎫 Support Martinique RP")
            .setDescription(`
Bienvenue dans le système de tickets.

Sélectionnez la catégorie correspondant à votre demande.

🤝 Partenariat
🏢 Demande RP
🎭 Animation
☎️ Fondation
⚠️ Report Joueur
🛡️ Report Staff
🔓 Demande Deban
👮 Recrutement
❓ Autres
            `)
            .setFooter({
                text: "Martinique RP • Support"
            })
            .setTimestamp();

        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_menu")
            .setPlaceholder("Choisissez une catégorie")
            .addOptions([
                {
                    label: "Partenariat",
                    value: "Partenariat",
                    emoji: "🤝"
                },
                {
                    label: "Demande RP",
                    value: "Demande RP",
                    emoji: "🏢"
                },
                {
                    label: "Animation",
                    value: "Animation",
                    emoji: "🎭"
                },
                {
                    label: "Fondation",
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
                    label: "Deban",
                    value: "Deban",
                    emoji: "🔓"
                },
                {
                    label: "Recrutement",
                    value: "Recrutement",
                    emoji: "👮"
                },
                {
                    label: "Autres",
                    value: "Autres",
                    emoji: "❓"
                }
            ]);

        const row = new ActionRowBuilder()
            .addComponents(menu);

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
});
client.on("interactionCreate", async interaction => {

    if (
        !interaction.isStringSelectMenu() ||
        interaction.customId !== "ticket_menu"
    ) return;

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

    switch (interaction.values[0]) {

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

    const embed = new EmbedBuilder()
        .setColor("#2ECC71")
        .setTitle("🎫 Ticket créé")
        .setDescription(`
Bonjour ${interaction.user}.

Un membre du staff viendra vous aider.

Merci de détailler votre demande.
        `)
        .setTimestamp();

    const buttons =
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("claim")
                    .setLabel("Claim")
                    .setEmoji("👤")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("close_confirm")
                    .setLabel("Fermer")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger)
            );

    await channel.send({
        content: `${interaction.user} <@&${STAFF_ROLE}>`,
        embeds: [embed],
        components: [buttons]
    });

    await interaction.reply({
        content: `✅ Ticket créé : ${channel}`,
        ephemeral: true
    });
});
// ================= BOUTONS =================

client.on("interactionCreate", async interaction => {

    if (!interaction.isButton()) return;

    // CLAIM

    if (interaction.customId === "claim") {

        if (
            !interaction.member.roles.cache.has(
                STAFF_ROLE
            )
        ) {
            return interaction.reply({
                content: "❌ Tu n'es pas staff.",
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `👤 ${interaction.user} a pris en charge ce ticket.`
        });
    }

    // FERMER

    if (interaction.customId === "close") {

        if (
            !interaction.member.roles.cache.has(
                STAFF_ROLE
            )
        ) {
            return interaction.reply({
                content: "❌ Tu n'es pas staff.",
                ephemeral: true
            });
        }

        const logChannel =
            interaction.guild.channels.cache.get(
                LOG_CHANNEL
            );

        if (logChannel) {

            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("🔒 Ticket fermé")
                .addFields(
                    {
                        name: "Ticket",
                        value: interaction.channel.name
                    },
                    {
                        name: "Fermé par",
                        value: interaction.user.tag
                    }
                )
                .setTimestamp();

            await logChannel.send({
                embeds: [embed]
            });
        }

        await interaction.reply(
            "🔒 Fermeture du ticket dans 5 secondes..."
        );

        setTimeout(async () => {
            await interaction.channel.delete();
        }, 5000);
    }
});
client.on("messageCreate", async message => {

    if (message.author.bot) return;

    if (!message.content.startsWith("!rename"))
        return;

    if (
        !message.member.roles.cache.has(
            STAFF_ROLE
        )
    ) {
        return message.reply(
            "❌ Tu n'es pas staff."
        );
    }

    const args =
        message.content.split(" ").slice(1);

    const nouveauNom =
        args.join("-");

    if (!nouveauNom) {
        return message.reply(
            "❌ Donne un nom."
        );
    }

    await message.channel.setName(
        nouveauNom
    );

    message.channel.send(
        `✏️ Ticket renommé : ${nouveauNom}`
    );
});
client.on("interactionCreate", async interaction => {

    if (!interaction.isButton()) return;

    // Confirmation fermeture

    if (interaction.customId === "close_confirm") {

        const row =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("close_ticket")
                        .setLabel("Confirmer")
                        .setStyle(ButtonStyle.Danger),

                    new ButtonBuilder()
                        .setCustomId("cancel_close")
                        .setLabel("Annuler")
                        .setStyle(ButtonStyle.Secondary)
                );

        return interaction.reply({
            content: "⚠️ Confirmer la fermeture du ticket ?",
            components: [row],
            ephemeral: true
        });
    }

    if (interaction.customId === "cancel_close") {
        return interaction.update({
            content: "❌ Fermeture annulée.",
            components: []
        });
    }

    if (interaction.customId === "close_ticket") {

        const messages =
            await interaction.channel.messages.fetch({
                limit: 100
            });

        const transcript =
            messages.reverse()
                .map(m =>
                    `[${m.author.tag}] : ${m.content}`
                )
                .join("\n");

        const logChannel =
            interaction.guild.channels.cache.get(
                LOG_CHANNEL
            );

        if (logChannel) {

            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("🔒 Ticket fermé")
                .addFields(
                    {
                        name: "Ticket",
                        value: interaction.channel.name
                    },
                    {
                        name: "Fermé par",
                        value: interaction.user.tag
                    }
                )
                .setTimestamp();

            await logChannel.send({
                embeds: [embed]
            });

            if (transcript.length > 0) {
                await logChannel.send({
                    content:
                        "```" +
                        transcript.substring(0, 1900) +
                        "```"
                });
            }
        }

        try {

            const ownerId =
                interaction.channel.topic;

            const user =
                await client.users.fetch(
                    ownerId
                );

            await user.send(
                `🎫 Votre ticket **${interaction.channel.name}** a été fermé.`
            );

        } catch {}

        await interaction.update({
            content:
                "🔒 Ticket fermé dans 5 secondes.",
            components: []
        });

        setTimeout(async () => {
            await interaction.channel.delete();
        }, 5000);
    }
});client.login(process.env.TOKEN);