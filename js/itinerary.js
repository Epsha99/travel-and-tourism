document.addEventListener('DOMContentLoaded', () => {
    const timeline = document.getElementById('itinerary-timeline');

    document.querySelectorAll('.draggable').forEach(setupDraggable);
    document.querySelectorAll('.drop-zone').forEach(setupDropZone);

    document.getElementById('add-day-btn').addEventListener('click', () => {
        const dayNum = document.querySelectorAll('.day-card').length + 1;
        const title = prompt(`Enter a title for Day ${dayNum}:`, 'Planned Activities') || 'Planned Activities';
        const zoneId = `day-${dayNum}-activities`;

        const card = document.createElement('div');
        card.className = 'day-card glass-effect';
        card.dataset.day = dayNum;
        card.innerHTML = `
            <div class="day-header">
                <h3 class="editable-day-title" title="Click to edit" style="cursor:pointer">Day ${dayNum}: ${title}</h3>
                <button class="btn-icon delete-day" title="Delete Day">️</button>
            </div>
            <div class="activity-container drop-zone" id="${zoneId}"></div>
            <button class="btn btn-outline add-activity-btn" data-target="${zoneId}">+ Add Activity</button>
        `;

        timeline.appendChild(card);
        setupDropZone(card.querySelector('.drop-zone'));
    });

    timeline.addEventListener('click', (e) => {

        const h3 = e.target.closest('.editable-day-title');
        if (h3) {
            const card = h3.closest('.day-card');
            const current = h3.textContent.split(':').slice(1).join(':').trim();
            const newTitle = prompt('Rename Day:', current);
            if (newTitle !== null)
                h3.textContent = `Day ${card.dataset.day}: ${newTitle || 'Planned Activities'}`;
        }

        if (e.target.closest('.delete-day')) {
            const card = e.target.closest('.day-card');
            if (confirm('Delete this day and all its activities?')) {
                card.remove();
                renumberDays();
            }
        }

        if (e.target.closest('.remove-activity'))
            e.target.closest('.activity-item').remove();

        const addBtn = e.target.closest('.add-activity-btn');
        if (addBtn) {
            const time  = prompt('Time (e.g. 09:00 AM):', '09:00 AM'); if (!time) return;
            const title = prompt('Activity Title:', 'New Activity');   if (!title) return;
            const desc  = prompt('Brief Description:', '') || '';

            const item = document.createElement('div');
            item.className = 'activity-item draggable';
            item.draggable = true;
            item.innerHTML = `
                <span class="time">${time}</span>
                <div class="activity-details"><h4>${title}</h4><p>${desc}</p></div>
                <button class="btn-icon remove-activity">✕</button>
            `;

            document.getElementById(addBtn.dataset.target).appendChild(item);
            setupDraggable(item);
        }
    });


    function renumberDays() {
        document.querySelectorAll('.day-card').forEach((card, i) => {
            const n = i + 1;
            card.dataset.day = n;

            const h3 = card.querySelector('.day-header h3');
            const titlePart = h3.textContent.includes(':')
                ? h3.textContent.split(':').slice(1).join(':').trim()
                : 'Planned Activities';
            h3.textContent = `Day ${n}: ${titlePart}`;

            const zone = card.querySelector('.drop-zone');
            const btn  = card.querySelector('.add-activity-btn');
            const id   = `day-${n}-activities`;
            zone.id = id;
            btn.dataset.target = id;
        });
    }

    function setupDraggable(el) {
        el.addEventListener('dragstart', () => {
            el.classList.add('dragging');
            setTimeout(() => el.style.opacity = '0.5', 0);
        });
        el.addEventListener('dragend', () => {
            el.classList.remove('dragging');
            el.style.opacity = '1';
        });
    }

    function setupDropZone(zone) {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dragging = document.querySelector('.dragging');
            if (!dragging) return;
            const after = getAfterElement(zone, e.clientY);
            after ? zone.insertBefore(dragging, after) : zone.appendChild(dragging);
        });
    }

    function getAfterElement(container, y) {
        return [...container.querySelectorAll('.draggable:not(.dragging)')]
            .reduce((closest, el) => {
                const offset = y - el.getBoundingClientRect().top - el.getBoundingClientRect().height / 2;
                return offset < 0 && offset > closest.offset ? { offset, element: el } : closest;
            }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});
