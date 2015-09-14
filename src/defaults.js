    module.exports = {
        appendLocation: (document.body || document.documentElement),
        addClassName: {
            base: '',
            buttonHolder: '',
            buttonOk: '',
            buttonCancel: '',
            closeBtn: '',
            form: '',
            overlay: '',
            popup: ''
        },
        baseClassName: 'popupS',
        flags: {
            bodyScroll: false,
            buttonReverse: false,
            closeByEsc: true,
            closeByOverlay: true,
            showCloseBtn: true
        },
        labels: {
            ok: 'OK',
            cancel: 'Cancel'
        },
        loader: 'spinner',
        zIndex: 10000
    };
