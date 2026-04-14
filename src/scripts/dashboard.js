(function () {
    const tabs = document.querySelectorAll(".dashboard-tab");
    const contents = {
        contacts: document.getElementById("contactsContent"),
        appointments: document.getElementById("appointmentsContent")
    };

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            Object.keys(contents).forEach(key => {
                contents[key].style.display = key === target ? "block" : "none";
            });
        });
    });

    const initDashboard = async () => {
        try {
            // Check auth
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "auth.html";
                return;
            }

            // Fetch Data
            const [contacts, appointments] = await Promise.all([
                window.api.get("/contacts"),
                window.api.get("/appointments")
            ]);

            // Update Stats
            document.getElementById("totalContacts").textContent = contacts.length;
            document.getElementById("totalAppointments").textContent = appointments.length;
            document.getElementById("totalUsers").textContent = "..." ; // We don't have get all users yet

            renderContacts(contacts);
            renderAppointments(appointments);
            renderChart(contacts, appointments);

        } catch (error) {
            console.error("Dashboard error:", error);
            if (error.message.includes("401") || error.message.includes("Unauthorized")) {
                window.location.href = "auth.html";
            }
        }
    };

    const renderContacts = (data) => {
        const body = document.getElementById("contactsTableBody");
        body.innerHTML = data.map(item => `
            <tr>
                <td>#${item.id}</td>
                <td><strong>${item.fullname}</strong></td>
                <td>${item.phone}</td>
                <td>${item.comment}</td>
                <td>${new Date(item.created_at).toLocaleDateString()}</td>
                <td><span class="status-badge status-new">${item.status}</span></td>
            </tr>
        `).join("");
    };

    const renderAppointments = (data) => {
        const body = document.getElementById("appointmentsTableBody");
        body.innerHTML = data.map(item => `
            <tr>
                <td>#${item.id}</td>
                <td>${item.patient_email}</td>
                <td><strong>${item.doctor_name}</strong></td>
                <td>${new Date(item.datetime).toLocaleString()}</td>
                <td><span class="status-badge status-scheduled">${item.status}</span></td>
            </tr>
        `).join("");
    };

    const renderChart = (contacts, appointments) => {
        const ctx = document.getElementById('activityChart').getContext('2d');
        
        // Group by day for the last 7 days
        const labels = [];
        const contactData = [];
        const appointmentData = [];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(dateStr);

            
            contactData.push(contacts.filter(c => new Date(c.created_at).toLocaleDateString() === dateStr).length);
            appointmentData.push(appointments.filter(a => new Date(a.datetime).toLocaleDateString() === dateStr).length);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Contacts',
                        data: contactData,
                        borderColor: '#1890ff',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Appointments',
                        data: appointmentData,
                        borderColor: '#52c41a',
                        tension: 0.4,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    };

    initDashboard();
})();
