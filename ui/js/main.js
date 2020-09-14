window.addEventListener('load', () => {
    const callbacks = {
        onUpdate: (data) => {
            console.log(data);
            document.getElementById('value').innerHTML = data.value;
        },
    };
    window.interactiveCanvas.ready(callbacks);
});