<template>
    <div class="login-page">
        <el-card class="login-container" shadow="hover">
            <img src="https://www.kugou.com/yy/static/images/play/logo.png" alt="App Logo" class="logo" />
            <h2>登录你的酷狗账号</h2>
            <div class="logintype-menu">
                <el-segmented v-model="loginType" :options="options" size="default" @change="handleTabSwitch" block />
            </div>
            <div v-if="loginType === '手机号登录'">
                <el-form :model="phoneForm" :rules="rules" @submit.prevent class="login-form">
                    <el-form-item prop="mobile">
                        <el-input v-model="phoneForm.mobile" placeholder="请输入手机号" clearable />
                    </el-form-item>
                    <el-form-item prop="code">
                        <el-input
                            v-model="phoneForm.code"
                            placeholder="请输入验证码"
                            clearable
                        >
                            <template #append>
                                <el-button
                                    type="primary"
                                    @click="sendCaptcha"
                                    :loading="isSendingCaptcha"
                                    :disabled="!phoneForm.mobile"
                                >
                                    发送验证码
                                </el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-button type="primary" @click="phoneLogin" :loading="isPhoneLoginLoading">立即登录</el-button>
                </el-form>
            </div>

            <div v-if="loginType === '邮箱登录'">
                <el-form :model="emailForm" :rules="rules" @submit.prevent class="login-form">
                    <el-form-item prop="email">
                        <el-input v-model="emailForm.email" placeholder="请输入登录邮箱" clearable />
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input v-model="emailForm.password" type="password" show-password placeholder="请输入密码" clearable />
                    </el-form-item>
                    <el-button type="primary" @click="emailLogin" :loading="isEmailLoginLoading">邮箱登录</el-button>
                </el-form>
            </div>

            <div v-if="loginType === '扫码登录'">
                <div class="qr-login">
                    <p>{{ tips }}</p>
                    <img :src="qrCode" v-if="qrCode" alt="二维码" class="qr-code" />
                    <el-empty description="正在生成二维码..." v-else />
                </div>
            </div>

            <p class="disclaimer">
                萌音 承诺不会保存你的任何账号信息到云端。你的密码会在本地进行加密后再传输到酷狗官方。萌音并非酷狗官方网站，输入账号信息前请慎重考虑,二维码扫码后需要等待几分钟才会登录成功.<b>推荐</b>使用验证码登录.
            </p>
        </el-card>
    </div>
</template>


<script setup>
import { ref, reactive, onMounted } from 'vue';
import { get } from '../utils/request';
import { MoeAuthStore } from '../stores/store';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

const loginType = ref('手机号登录');

const options = ['手机号登录', '邮箱登录', '扫码登录'];

const MoeAuth = MoeAuthStore();
const router = useRouter();
const route = useRoute();

const emailForm = reactive({
    email: '',
    password: ''
});

const phoneForm = reactive({
    mobile: '',
    code: ''
});

const rules = {
    code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }],
    mobile: [
        { required: true, message: "请输入手机号码", trigger: "blur" },
        {
            validator: (rule, value, callback) => {
                if (/^1\d{10}$/.test(value) === false) {
                    callback(new Error("手机号格式错误"));
                } else {
                    callback();
                }
            },
            trigger: "blur"
        }
    ],
    email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        {
            validator: (rule, value, callback) => {
                if (/^\w{1,64}@[a-z0-9\-]{1,256}(\.[a-z]{2,6}){1,2}$/i.test(value) === false) {
                    callback(new Error("邮箱格式错误"));
                } else {
                    callback();
                }
            },
            trigger: "blur"
        }
    ]
};

const qrKey = ref('');
const qrCode = ref('');
const tips = ref('请使用酷狗扫描二维码登录');
const isSendingCaptcha = ref(false);
const isPhoneLoginLoading = ref(false);
const isEmailLoginLoading = ref(false);

// 邮箱登录
const emailLogin = async () => {
    if (!emailForm.email) {
        ElMessage.error('请输入邮箱');
        return;
    }
    // 验证邮箱格式
    const emailPattern = /^\w{1,64}@[a-z0-9\-]{1,256}(\.[a-z]{2,6}){1,2}$/i;
    if (!emailPattern.test(emailForm.email)) {
        ElMessage.error('邮箱格式错误');
        return;
    }
    if (!emailForm.password) {
        ElMessage.error('请输入密码');
        return;
    }
    isEmailLoginLoading.value = true;
    try {
        const response = await get(`/login?username=${emailForm.email}&password=${emailForm.password}`);
        if (response.status === 1) {
            MoeAuth.setData({ UserInfo: response.data });
            router.push(route.query.redirect || '/library');
            ElMessage.success('登录成功');
        } else {
            console.error('登录失败:', response.data);
            ElMessage.error(`登录失败，${response.data}`);
        }
    } catch (error) {
        ElMessage.error(error.message || '登录失败');
    } finally {
        isEmailLoginLoading.value = false;
    }
};

// 发送验证码
const sendCaptcha = async () => {
    if (!phoneForm.mobile) {
        ElMessage.warning('请输入手机号');
        return;
    }
    // 验证手机号格式
    const mobilePattern = /^1\d{10}$/;
    if (!mobilePattern.test(phoneForm.mobile)) {
        ElMessage.warning('手机号格式错误');
        return;
    }
    isSendingCaptcha.value = true;
    try {
        const response = await get(`/captcha/sent?mobile=${phoneForm.mobile}`);
        if (response.status === 1) {
            ElMessage.success('验证码已发送');
        } else {
            console.error('验证码发送失败:', response.data);
            ElMessage.error(`验证码发送失败，${response.data}`);
        }
    } catch (error) {
        ElMessage.error(error.message || '验证码发送失败');
    } finally {
        isSendingCaptcha.value = false;
    }
};

const phoneLogin = async () => {
    if (!phoneForm.mobile) {
        ElMessage.warning('请输入手机号');
        return;
    }
    if (!phoneForm.code) {
        ElMessage.warning('请输入验证码');
        return;
    }
    isPhoneLoginLoading.value = true;
    try {
        const response = await get(`/login/cellphone?mobile=${phoneForm.mobile}&code=${phoneForm.code}`);
        if (response && response.status === 1) {
            MoeAuth.setData({ UserInfo: response.data });
            router.push(route.query.redirect || '/library');
            ElMessage.success('登录成功');
        } else {
            console.error('登录失败:', response ? response.data : '无响应数据');
            ElMessage.error(`登录失败，${response ? response.data : '无响应数据'}`);
        }
    } catch (error) {
        console.error('登录失败:', error.message || '未知错误');
        ElMessage.error(error.message || '登录失败');
    } finally {
        isPhoneLoginLoading.value = false;
    }
};

// 切换登录方式
const handleTabSwitch = (value) => {
    if (value === '扫码登录') {
        getQrCode();
    }
};

// 获取二维码
const getQrCode = async () => {
    try {
        // 获取二维码 key
        const keyResponse = await get('/login/qr/key');
        if (keyResponse.status === 1) {
            qrKey.value = keyResponse.data.qrcode;

            // 使用 key 创建二维码
            const qrResponse = await get(`/login/qr/create?key=${qrKey.value}&qrimg=true`);
            if (qrResponse.code === 200) {
                qrCode.value = qrResponse.data.base64;
                console.log(qrCode.value);

                checkQrStatus();
            } else {
                ElMessage.error('获取二维码失败');
            }
        } else {
            ElMessage.error('二维码生成失败');
        }
    } catch {
        ElMessage.error('二维码生成失败');
    }
};

// 检查二维码扫描状态
const checkQrStatus = async () => {
    const interval = setInterval(async () => {
        try {
            const response = await get(`/login/qr/check?key=${qrKey.value}`);
            if (response.status === 1) {
                if (response.data.status === 2) {
                    tips.value = `用户 ${response.data.nickname} 已扫码,等待确认`;
                } else if (response.data.status === 4) {
                    clearInterval(interval);
                    MoeAuth.setData({ UserInfo: response.data });
                    ElMessage.success('二维码登录成功');
                } else if (response.data.status === 0) {
                    clearInterval(interval);
                    ElMessage.error('二维码已过期，请重新生成');
                }
            }
        } catch {
            clearInterval(interval);
            ElMessage.error('二维码检测失败');
        }
    }, 5000);
};

onMounted(() => {
    if (loginType.value === '扫码登录') {
        getQrCode();
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
  padding: 20px;
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.logo {
  width: 60px;
  margin-bottom: 10px;
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.el-form-item {
  margin-bottom: 10px;
}


.qr-login {
  text-align: center;
  margin-top: 20px;
}

.qr-code {
  width: 200px;
  height: 200px;
  border-radius: 10px;
  border: 1px solid #eaeaea;
}

.disclaimer {
  font-size: 12px;
  color: #666;
  margin-top: 20px;
  line-height: 1.5;
  border-top: 1px solid #ddd;
  padding-top: 10px;
  text-align: left;
}

.logintype-menu {
  margin-bottom: 20px;
}

.logintype-menu .el-segmented {
  --el-segmented-item-selected-color: #fff;
  --el-segmented-item-selected-bg-color: #409eff;
  --el-border-radius-base: 16px;
}
</style>