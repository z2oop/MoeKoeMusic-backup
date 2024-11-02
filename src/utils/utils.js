export const applyColorTheme = (theme) => {
    let colors;
    if (theme === '男男蓝') {
        colors = {
            '--primary-color': '#4A90E2',
            '--secondary-color': '#AEDFF7',
            '--background-color': '#E8F4FA',
            '--color-primary': '#2A6DAF',
            '--color-secondary-bg-for-transparent': 'rgba(174, 223, 247, 0.28)',
            '--color-box-shadow': 'rgba(74, 144, 226, 0.2)',
        };
    } else if (theme === '头顶绿') {
        colors = {
            '--primary-color': '#34C759',
            '--secondary-color': '#A7F3D0',
            '--background-color': '#E5F9F0',
            '--color-primary': '#28A745',
            '--color-secondary-bg-for-transparent': 'rgba(167, 243, 208, 0.28)',
            '--color-box-shadow': 'rgba(52, 199, 89, 0.2)',
        };
    } else {
        colors = {
            '--primary-color': '#FF69B4',
            '--secondary-color': '#FFB6C1',
            '--background-color': '#FFF0F5',
            '--color-primary': '#ea33e4',
            '--color-secondary-bg-for-transparent': 'rgba(209, 209, 214, 0.28)',
            '--color-box-shadow': 'rgba(255, 105, 180, 0.2)',
        };
    }

    Object.keys(colors).forEach(key => {
        document.documentElement.style.setProperty(key, colors[key]);
    });
};


export const getCover = (coverUrl, size) => {
    if (!coverUrl) return;
    return coverUrl.replace("{size}", size);
};

export const formatMilliseconds = (time) => {
    const milliseconds = time > 3600 ? time : time * 1000;
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}分${seconds}秒`;
};

export const setTheme = (theme) => {
    const root = document.documentElement;

    if (theme === '深色') {
        root.setAttribute('data-theme', 'dark');
    } else if (theme === '浅色') {
        root.setAttribute('data-theme', 'light');
    } else if (theme === '自动') {
        // 跟随系统主题
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        root.setAttribute('data-theme', prefersDarkScheme.matches ? 'dark' : 'light');

        // 添加监听器，以便系统主题更改时自动切换
        prefersDarkScheme.addEventListener('change', (e) => {
            root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        });
    }
};