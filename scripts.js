document.querySelector('.admin-button').addEventListener('click', function() {
    const adminList = document.getElementById('admins');
    adminList.classList.toggle('hidden');
});

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function startCooldown(duration) {
    const cooldownDisplay = document.getElementById('cooldown');
    const countdownTimer = document.getElementById('countdown-timer');
    cooldownDisplay.classList.remove('hidden');
    countdownTimer.classList.remove('hidden');
    let remainingTime = duration;

    const interval = setInterval(() => {
        remainingTime--;
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        cooldownDisplay.textContent = `You can send another request in ${remainingTime} seconds`;
        countdownTimer.textContent = `Cooldown: ${minutes}m ${seconds}s`;

        if (remainingTime <= 0) {
            clearInterval(interval);
            cooldownDisplay.classList.add('hidden');
            countdownTimer.classList.add('hidden');
            document.querySelector('#supportForm button').disabled = false;
        }
    }, 1000);
}

document.getElementById('supportForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const problem = document.getElementById('problem').value.trim();

    if (!username || !contact || !problem) {
        showNotification('Please fill out all fields.');
        return;
    }

    const webhookURL = 'https://discord.com/api/webhooks/1251568248047276053/YNeZYLCvrvRwFLrFVDNHqDQ0uMr5ECkynuhRoxdt0_RTygqvoTubWgdqcGH2vcM7pgTR';

    const embed = {
        "title": "New support request received",
        "description": `**User Name:** ${username}\n**Contact Info:** ${contact}\n**Problem Details:**\n${problem}`,
        "color": 8421504,
        "fields": [{
            "name": "Instructions",
            "value": "React with ✅ to accept or ❌ to refuse."
        }]
    };

    const payload = {
        embeds: [embed]
    };

    fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                showNotification('Sent Successfully');
                document.getElementById('supportForm').reset();

                // Start cooldown
                document.querySelector('#supportForm button').disabled = true;
                startCooldown(15 * 60); // 15 minutes cooldown
            } else {
                showNotification('Failed to send');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to send');
        });
});

function handleReaction(message, user, reaction) {
    const webhookMessageId = message.id;
    const acceptedFieldIndex = message.embeds[0].fields.findIndex(field => field.name === 'Accepted by');
    const refusedFieldIndex = message.embeds[0].fields.findIndex(field => field.name === 'Refused by');

    let updatedEmbed = message.embeds[0];

    if (reaction === '✅' && acceptedFieldIndex !== -1) {
        updatedEmbed.fields[acceptedFieldIndex].value = `Accepted by: <@${user.id}>`;
    } else if (reaction === '❌' && refusedFieldIndex !== -1) {
        updatedEmbed.fields[refusedFieldIndex].value = `Refused by: <@${user.id}>`;
    }

    fetch(`https://discord.com/api/webhooks/${webhookMessageId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ embeds: [updatedEmbed] })
    }).then(response => {
        if (!response.ok) {
            console.error('Failed to update message');
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}

// Simulation of receiving a reaction (for demonstration purposes)
function simulateReaction(messageId, userId, reaction) {
    const message = {
        id: messageId,
        embeds: [{
            fields: [
                { name: 'Accepted by', value: 'Pending' },
                { name: 'Refused by', value: 'Pending' }
            ]
        }]
    };
    const user = { id: userId };

    handleReaction(message, user, reaction);
}

// Simulate a reaction for testing (remove or replace this in actual implementation)
simulateReaction('1251568248047276053', '1234567890', '✅');