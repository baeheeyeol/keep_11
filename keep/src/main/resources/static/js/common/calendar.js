(function() {
    let overlay, modal, yearDisplay, monthDisplay, yearDropdown, monthDropdown;
    let prevBtn, nextBtn, bodyTbody;
    let viewYear, viewMonth;
    let activeInput = null;
    let initialized = false;
    const today = new Date();

    function populateYearDropdown() {
        yearDropdown.innerHTML = '';
        const start = today.getFullYear() - 10;
        const end = today.getFullYear() + 10;
        for (let y = start; y <= end; y++) {
            const li = document.createElement('li');
            li.textContent = `${y}`;
            li.dataset.year = y;
            li.addEventListener('click', () => {
                viewYear = y;
                renderCalendar(viewYear, viewMonth);
                yearDropdown.classList.add('hidden');
                modal.classList.remove('dimmed');
                monthDisplay.classList.remove('dimmed');
                yearDisplay.classList.remove('dimmed');
            });
            yearDropdown.appendChild(li);
        }
    }

    function populateMonthDropdown() {
        monthDropdown.innerHTML = '';
        for (let m = 0; m < 12; m++) {
            const li = document.createElement('li');
            li.textContent = `${m + 1}`;
            li.dataset.month = m;
            li.addEventListener('click', () => {
                viewMonth = m;
                renderCalendar(viewYear, viewMonth);
                monthDropdown.classList.add('hidden');
                modal.classList.remove('dimmed');
                monthDisplay.classList.remove('dimmed');
                yearDisplay.classList.remove('dimmed');
            });
            monthDropdown.appendChild(li);
        }
    }

    function renderCalendar(year, month) {
        yearDisplay.textContent = `${year}년`;
        monthDisplay.textContent = `${month + 1}월`;

        bodyTbody.innerHTML = '';
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let row = document.createElement('tr');
        for (let i = 0; i < firstDay; i++) {
            row.appendChild(document.createElement('td'));
        }
        for (let d = 1; d <= daysInMonth; d++) {
            if (row.children.length === 7) {
                bodyTbody.appendChild(row);
                row = document.createElement('tr');
            }
            const cell = document.createElement('td');
            cell.textContent = d;
            const dayOfWeek = new Date(year, month, d).getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                cell.classList.add('weekend');
            }
			
            cell.addEventListener('click', () => {
                if (!activeInput) return;
                const selectedDate = new Date(year, month, d);
                const view = activeInput.dataset.view;
                const zeroPad = num => String(num).padStart(2, '0');
                let formattedValue;
                if (view === 'weekly') {
                    const dayIndex = selectedDate.getDay();
                    const weekStart = new Date(selectedDate);
                    const weekEnd = new Date(selectedDate);
                    weekStart.setDate(selectedDate.getDate() - dayIndex);
                    weekEnd.setDate(selectedDate.getDate() + (6 - dayIndex));

                    const sMM = zeroPad(weekStart.getMonth() + 1);
                    const sDD = zeroPad(weekStart.getDate());
                    const eMM = zeroPad(weekEnd.getMonth() + 1);
                    const eDD = zeroPad(weekEnd.getDate());

                    formattedValue = `${sMM}.${sDD}-${eMM}.${eDD}`;
                    activeInput.dataset.selectDate = [
                        selectedDate.getFullYear(),
                        zeroPad(selectedDate.getMonth() + 1),
                        zeroPad(selectedDate.getDate())
                    ].join('-');

                    window.updateWeekDateNumbers();
                } else if (view === 'monthly') {
                    const yyyy = selectedDate.getFullYear();
                    const mm = zeroPad(selectedDate.getMonth() + 1);
                    const dd = zeroPad(selectedDate.getDate());
                    formattedValue = `${yyyy}.${mm}`;
                    activeInput.dataset.selectDate = `${yyyy}-${mm}-${dd}`;
                } else if (view === 'daily') {
                    const yyyy = selectedDate.getFullYear();
                    const mm = zeroPad(selectedDate.getMonth() + 1);
                    const dd = zeroPad(selectedDate.getDate());
                    formattedValue = `${yyyy}.${mm}.${dd}`;
                    activeInput.dataset.selectDate = `${yyyy}-${mm}-${dd}`;
                } else {
                    const yyyy = selectedDate.getFullYear();
                    const mm = zeroPad(selectedDate.getMonth() + 1);
                    const dd = zeroPad(selectedDate.getDate());
                    formattedValue = `${yyyy}-${mm}-${dd}`;
                    activeInput.dataset.selectDate = `${yyyy}-${mm}-${dd}`;
                }

                activeInput.value = formattedValue;
                if (window.updateDisplay) {
                    window.updateDisplay(view);
                }
                if (window.refreshSchedule) {
                    window.refreshSchedule();
                }
                closeCalendar();
            });

            row.appendChild(cell);
        }
        while (row.children.length < 7) {
            row.appendChild(document.createElement('td'));
        }
        bodyTbody.appendChild(row);
    }

    function openCalendar(el) {
        activeInput = el;
        const rect = el.getBoundingClientRect();
        modal.style.top = `${rect.bottom + 4}px`;
        modal.style.left = `${rect.left}px`;
        renderCalendar(viewYear, viewMonth);
        overlay.classList.remove('hidden');
    }

    function closeCalendar() {
        overlay.classList.add('hidden');
        yearDropdown.classList.add('hidden');
        monthDropdown.classList.add('hidden');
        modal.classList.remove('dimmed');
    }

    function initCalendarModal(dateSource) {
        let input;
        if (typeof dateSource === 'string') {
            input = document.getElementById(dateSource);
        } else if (dateSource instanceof HTMLElement) {
            input = dateSource;
        }
        if (!input) return;

        input.addEventListener('click', () => openCalendar(input));

        if (initialized) return;

        overlay = document.getElementById('calendar-overlay');
        modal = document.getElementById('calendar-modal');
        yearDisplay = document.getElementById('cal-year-display');
        monthDisplay = document.getElementById('cal-month-display');
        yearDropdown = document.getElementById('year-dropdown');
        monthDropdown = document.getElementById('month-dropdown');
        prevBtn = document.getElementById('cal-prev');
        nextBtn = document.getElementById('cal-next');
        bodyTbody = document.getElementById('calendar-body');

        viewYear = today.getFullYear();
        viewMonth = today.getMonth();

        prevBtn.addEventListener('click', () => {
            viewMonth--;
            if (viewMonth < 0) { viewMonth = 11; viewYear--; }
            renderCalendar(viewYear, viewMonth);
        });
        nextBtn.addEventListener('click', () => {
            viewMonth++;
            if (viewMonth > 11) { viewMonth = 0; viewYear++; }
            renderCalendar(viewYear, viewMonth);
        });

        const elements = {
            year: { display: yearDisplay, dropdown: yearDropdown },
            month: { display: monthDisplay, dropdown: monthDropdown }
        };
        ['year', 'month'].forEach(type => {
            const { display, dropdown } = elements[type];
            const other = elements[type === 'year' ? 'month' : 'year'];
            display.addEventListener('click', () => {
                const isOpening = dropdown.classList.contains('hidden');
                dropdown.classList.toggle('hidden');
                other.dropdown.classList.add('hidden');
                other.display.classList.toggle('dimmed', isOpening);
                modal.classList.toggle('dimmed', isOpening);
            });
        });

        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeCalendar();
        });

        populateYearDropdown();
        populateMonthDropdown();
        initialized = true;
    }

    window.initCalendarModal = initCalendarModal;
})();