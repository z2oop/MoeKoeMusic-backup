<template>
    <div class="login-page">
        <div class="login-container">
            <img src="https://www.kugou.com/yy/static/images/play/logo.png" alt="App Logo" />
            <h2>登录你的酷狗账号</h2>
            <div class="login-form">
                <template v-if="loginType === 'email'">
                    <div class="input-group">
                        <i class="fas fa-envelope"></i>
                        <input v-model="email" type="email" placeholder="邮箱" />
                    </div>
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input v-model="password" type="password" placeholder="密码" />
                    </div>
                    <button class="login-button" @click="emailLogin">邮箱登录</button>
                </template>

                <template v-if="loginType === 'phone'">
                    <div class="input-group">
                        <i class="fas fa-phone"></i>
                        <input v-model="mobile" type="tel" placeholder="手机号" />
                    </div>
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input v-model="code" type="text" placeholder="验证码" />
                        <button @click="sendCaptcha" class="login-button sms-button">发送验证码</button>
                    </div>
                    <button class="login-button" @click="phoneLogin">手机号登录</button>
                </template>

                <template v-if="loginType === 'qr'">
                    <div class="qr-login">
                        <p>{{ tips }}</p>
                        <img :src="qrCode" alt="二维码" v-if="qrCode" />
                        <p v-else>正在生成二维码...</p>
                    </div>
                </template>

                <div class="login-options">
                    <a href="#" @click.prevent="switchLoginType('email')">账号登录</a> |
                    <a href="#" @click.prevent="switchLoginType('qr')">二维码登录</a>
                </div>
            </div>
            <p class="disclaimer">
                萌音 承诺不会保存你的任何账号信息到云端。你的密码会在本地进行加密后再传输到酷狗官方。萌音
                并非酷狗官方网站，输入账号信息前请慎重考虑,二维码扫码后需要等待几分钟才会登录成功.<b>推荐</b>使用验证码登录.
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { get, post } from '../utils/request';
import { MoeAuthStore } from '../stores/store';
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();  // 获取路由实例
const MoeAuth = MoeAuthStore();
const loginType = ref('phone');
const email = ref('');
const password = ref('');
const mobile = ref('');
const code = ref('');
const qrKey = ref('');
const qrCode = ref('');
const tips = ref('请使用酷狗扫描二维码登录');
const route = useRoute();
// 邮箱登录
const emailLogin = async () => {
    try {
        const response = await get(`/login?username=${email.value}&password=${password.value}`);
        if (response.status == 1) {
            MoeAuth.setData({UserInfo:response.data});
            router.push(route.query.redirect || '/library');
        }
    } catch (error) {
        window.$modal.alert(error.message);
    }
};

// 发送验证码
const sendCaptcha = async () => {
    const response = await get(`/captcha/sent?mobile=${mobile.value}`);
    if (response.status == 1) {
        window.$modal.alert('验证码已发送');
    } else {
        window.$modal.alert('验证码发送失败');
    }
};

// 手机号登录
const phoneLogin = async () => {
    const response = await get(`/login/cellphone?mobile=${mobile.value}&code=${code.value}`);
    if (response.status == 1) {
        MoeAuth.setData({UserInfo:response.data});
        router.push(route.query.redirect || '/library');
    } else {
        window.$modal.alert('手机号登录失败，请检查验证码');
    }
};

// 切换登录方式
const switchLoginType = (type) => {
    loginType.value = type;
    if (type === 'qr') {
        generateQrCode();
    }
};

// 生成二维码
const generateQrCode = async () => {
    const response = await get('/login/qr/key');
    if (response.status == 1) {
        qrKey.value = response.data.qrcode;
        createQrCode();
    } else {
        window.$modal.alert('二维码生成失败');
    }
};

// 创建二维码
const createQrCode = async () => {
    const response = await get(`/login/qr/create?key=${qrKey.value}&qrimg=true`);
    if (response.code == 200) {
        qrCode.value = response.data.base64;
        checkQrStatus();
    } else {
        window.$modal.alert('获取二维码失败');
    }
};

// 检查二维码扫描状态
const checkQrStatus = async () => {
    const interval = setInterval(async () => {
        try {
            const response = await get(`/login/qr/check?key=${qrKey.value}`);
            if (response.status === 1) {
                if (response.data.status === 2) {
                    tips.value = `用户 ${response.data.nickname} 已扫码,等待确认(该过程耗时较久,请不要刷新页面)`;
                }else if (response.data.status === 4) {
                    clearInterval(interval);
                    MoeAuth.setData({UserInfo:response.data});
                } else if (response.data.status === 0) {
                    clearInterval(interval);
                    window.$modal.alert('二维码已过期，请重新生成');
                }
            }
        } catch (error) {
            clearInterval(interval);
            window.$modal.alert('二维码检测失败');
        }
    }, 5000);
};

onMounted(() => {
    if (loginType.value === 'qr') {
        generateQrCode();
    }
});
</script>
<style scoped>
.login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 85vh;
}

.login-container {
    background-color: #fff;
    border-radius: 12px;
    padding: 40px;
    width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
}


h2 {
    color: var(--text-color);
    margin-bottom: 20px;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.input-group {
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    padding: 12px;
    border-radius: 8px;
}

.input-group i {
    color: #aaa;
    margin-right: 10px;
}

.input-group input {
    border: none;
    background: none;
    outline: none;
    width: 100%;
    font-size: 16px;
}

.login-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 12px;
    font-size: 16px;
    cursor: pointer;
}

.sms-button {
    font-size: 12px;
    padding: 0px;
    width: 100px;
    height: 20px;
}

.login-button:hover {
    background-color: var(--color-primary);
}

.login-options {
    margin-top: 10px;
}

.login-options a {
    color: var(--primary-color);
    text-decoration: none;
    display: inline;
}

.login-options a:hover {
    text-decoration: underline;
}

.qr-login {
    text-align: center;
}

.qr-login img {
    width: 200px;
    height: 200px;
    margin-top: 10px;
}

.disclaimer {
    font-size: 12px;
    color: #666;
    line-height: 1.5;
    border-top: 1px solid;
    padding-top: 5px;
}
</style>