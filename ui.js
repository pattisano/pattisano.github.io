
const ui = {
    dialog: new mdc.dialog.MDCDialog(document.querySelector('.mdc-dialog')),
    createElement: (name,opts) => {
        const el = document.createElement(name);
        if (opts) {
            for (let prop in opts) {
                if (prop === 'classList') {
                    for (let i = 0; i < opts.classList.length; i++)
                        el.classList.add(opts.classList[i]);
                } else if (prop.includes('-') || prop === 'for') {
                    el.setAttribute(prop, opts[prop]);
                } else {
                    el[prop] = opts[prop];
                }
            }
        }
        return el;
    },
    createFAB: (icon, ariaLabel)=>{
        const btn = ui.createElement('button', {
            classList: ['mdc-fab'],
            'aria-label': ariaLabel
        });
        btn.appendChild(ui.createElement('div', {
            classList: ['mdc-fab__ripple']
        }));
        btn.appendChild(ui.createElement('span', {
            classList: ['mdc-fab__icon', 'material-icons'],
            textContent: icon
        }));
        const ripple = new mdc.ripple.MDCRipple(btn);
        return btn;
    }
}

ui.delay = (function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
     };
})();