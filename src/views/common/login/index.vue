<template>
  <div class="login">
    <div id="container">
      <div id="output"></div>
    </div>
    <transition name="el-fade-in-linear">
      <div v-if="user.loginCnt === 0">
        <div class="amend-form">
          <p class="form-title">
            <span>请修改初始密码</span>
          </p>
          <el-form
            key="amend"
            ref="amendRef"
            :model="amendData"
            :rules="amendRules"
            @keydown.enter.stop.native="!loadingServer.amend && amend()"
          >
            <el-form-item prop="oldPassword">
              <el-input
                v-model="amendData.oldPassword"
                v-focus
                :type="type.amendOld"
                :maxlength="64"
                autocomplete="off"
                placeholder="请输入原密码"
              ></el-input>
              <span class="fa fa-lock"></span>
              <PasswordEye v-model="type.amendOld"></PasswordEye>
            </el-form-item>
            <el-form-item prop="newPassword">
              <el-input
                v-model="amendData.newPassword"
                :type="type.amendNew"
                :maxlength="64"
                autocomplete="off"
                placeholder="请输入新密码"
              ></el-input>
              <span class="fa fa-lock"></span>
              <PasswordEye v-model="type.amendNew"></PasswordEye>
            </el-form-item>
            <el-form-item prop="rPassword">
              <el-input
                v-model="amendData.rPassword"
                :type="type.amendR"
                :maxlength="64"
                autocomplete="off"
                placeholder="请再次输入新密码"
              ></el-input>
              <span class="fa fa-lock"></span>
              <PasswordEye v-model="type.amendR"></PasswordEye>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                :loading="loadingServer.amend"
                @click.stop="amend()"
              >确定修改
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="amend-form-background"></div>
      </div>
      <div v-else class="login-form clearfix">
        <p class="form-title">
          <span v-text="`欢迎登录${config.APP_NAME}${config.ROLE_NAME[deployType]}`"></span>
        </p>
        <el-form
          key="login"
          ref="formRef"
          :model="formData"
          :rules="formRules"
          @keydown.enter.stop.native="!loadingServer.login && login()"
        >
          <el-form-item prop="username">
            <el-input
              v-model="formData.username"
              v-focus
              :maxlength="64"
              autocomplete="off"
              placeholder="请输入用户名"
            ></el-input>
            <span class="fa fa-user"></span>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="formData.password"
              :type="type.login"
              :maxlength="64"
              autocomplete="off"
              placeholder="请输入密码"
            ></el-input>
            <span class="fa fa-lock"></span>
            <PasswordEye v-model="type.login"></PasswordEye>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="loadingServer.login"
              @click.stop="login()"
            >登 录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>
    <el-dialog
      :visible.sync="dialog.verify"
      title="手机验证码"
      width="400px"
      top="25vh"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      custom-class="dialog-verify"
    >
      <el-form
        ref="verifyRef"
        :model="verifyData"
        :rules="verifyRules"
        class="verify-form"
        @keydown.enter.stop.native="!loadingServer.verify && verify()"
      >
        <el-form-item prop="mobile">
          <span>手机号码：{{ mobile }}</span>
        </el-form-item>
        <el-form-item prop="imgCode" class="form-img-code">
          <el-input
            v-model="verifyData.imgCode"
            v-focus
            :maxlength="4"
            autocomplete="off"
            placeholder="请输入图形验证码"
          >
            <div slot="append" @click.stop="changeImg()">
              <ImgLoading ref="imgLoading" :src="imgPath" :size="30"></ImgLoading>
            </div>
          </el-input>
        </el-form-item>
        <el-form-item prop="vcode">
          <el-input
            v-model="verifyData.vcode"
            :maxlength="6"
            autocomplete="off"
            placeholder="请输入验证码"
          >
            <el-button
              slot="append"
              :loading="loadingServer.code"
              :disabled="verifyText !== '获取验证码'"
              class="query-button form-button-code"
              @click.stop="getCode()"
            >
              {{ verifyText }}
            </el-button>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="loadingServer.verify" @click.stop="verify()">确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import PasswordEye from '../../../components/password-eye/index.vue';
  import ImgLoading from '../../../components/img-loading/index.vue';
  import VictorAdmin from '../../../../public/victor-admin';
  import VictorOther from '../../../../public/victor-other';
  import local from '../../../store/modules/local';
  import {
    USER_GET, USER_SET, USER_CLEAR, USER_LOCAL_NAME
  } from '../../../store/modules/user';
  import { LOADING_SET, LOADING_CHANGE } from '../../../store/modules/loading-server';

  export default {
    name: 'Login',
    components: {
      ImgLoading,
      PasswordEye
    },
    data() {
      return {
        victor: null,
        type: {
          login: 'password',
          amendOld: 'password',
          amendNew: 'password',
          amendR: 'password'
        }, // 密码框类型
        formData: {
          username: '',
          password: ''
        }, // 登录对象
        formRules: {
          username: [
            {
              validator: this.$verify({ text: '用户名' }),
              trigger: 'blur'
            }
          ],
          password: [
            {
              validator: this.$verify({
                text: '密码',
                minLength: 6
              }),
              trigger: 'blur'
            }
          ]
        }, // 登录验证对象
        dialog: {
          verify: false,
          imgCode: false
        }, // 弹窗状态对象
        mobile: '', // 用户手机号
        userData: {}, // 登录后用户对象
        imgPath: '', // 图片验证码地址
        verifyText: '获取验证码', // 获取验证码按钮内容
        verifyData: {
          imgCode: '',
          vcode: ''
        }, // 验证码对象
        verifyRules: {
          imgCode: [
            {
              validator: this.$verify({
                text: '图形验证码',
                minLength: 4
              }),
              trigger: 'blur'
            }
          ],
          vcode: [
            {
              validator: this.$verify({
                text: '验证码',
                minLength: 6
              }),
              trigger: 'blur'
            }
          ]
        }, // 验证码验证对象
        amendData: {
          oldPassword: '',
          newPassword: '',
          rPassword: ''
        }, // 修改初始密码对象
        amendRules: {
          oldPassword: [
            {
              validator: this.$verify({
                text: '原密码',
                minLength: 6
              }),
              trigger: 'blur'
            }
          ],
          newPassword: [
            {
              validator: this.$verify({
                text: '新密码',
                minLength: 6,
                customCheck: () => {
                  if (this.amendData.rPassword) {
                    this.$refs.amendRef.validateField('rPassword');
                  }
                }
              }),
              trigger: 'blur'
            }
          ],
          rPassword: [
            {
              validator: this.$verify({
                text: '确认密码',
                minLength: 6,
                customCheck: (rule, value, callback) => {
                  if (value !== this.amendData.newPassword) {
                    return callback(new Error('确认密码与新密码不一致'));
                  }
                  return true;
                }
              }),
              trigger: 'blur'
            }
          ]
        } // 修改初始密码验证对象
      };
    },
    computed: {
      config() {
        return this.$store.state.config;
      }, // 初始化配置对象
      deployType() {
        return this.config.DEPLOY_TYPE;
      }, // 部署类型
      deployTypes() {
        return this.config.DEPLOY_TYPES;
      }, // 部署类型枚举
      user() {
        return this.$store.state.user;
      }, // 用户对象
      loadingServer() {
        return this.$store.state.loadingServer;
      } // 按钮级loading对象
    },
    beforeRouteEnter(to, from, next) {
      const user = local.getItem(USER_LOCAL_NAME);
      if (user && user.id) {
        next({ name: 'dashboard' });
      } else {
        next();
      }
    },
    created() {
      this.$store.dispatch(LOADING_SET, { names: ['login', 'code', 'verify', 'amend'] });
    },
    mounted() {
      if (this.deployType === this.deployTypes.admins) {
        this.victor = new VictorAdmin('container', 'output');
      } else {
        this.victor = new VictorOther('container', 'output');
      }
    },
    methods: {
      login() {
        this.$refs.formRef.validate((valid) => {
          if (valid) {
            this.$store.dispatch(LOADING_CHANGE, { login: true });
            const { username, password } = this.formData;
            this.$axios.post('login', {
              username: `${username}`,
              password,
              module: Number(this.config.DEPLOY_TYPE) + 10
            })
              .then((response) => {
                ({
                  data: this.userData,
                  data: { mobile: this.mobile }
                } = response);
                console.log(response, 3333);
                this.$store.dispatch(USER_SET, this.userData)
                  .then(() => {
                    this.$store.dispatch(USER_GET, false)
                      .then(() => {
                        if (this.user.loginCnt > 0) {
                          this.$router.push({ name: 'dashboard' });
                        } else {
                          this.$store.dispatch(USER_CLEAR);
                          this.$store.dispatch(USER_SET, this.userData);
                          this.dialog.verify = false;
                        }
                      });
                  });
              });
          }
        });
      }, // 登录
      changeImg() {
        this.imgPath = `${this.config.RESOURCE_URL}general/pub/imgcode/${this.mobile}?time=${new Date().getTime()}`;
        setTimeout(() => {
          this.$refs.imgLoading.changeImg();
        }, 0);
      }, // 切换图形验证码
      getCode() {
        const { imgCode } = this.verifyData;
        if (imgCode) {
          this.$store.dispatch(LOADING_CHANGE, { code: true });
          this.$axios.post(`general/pub/sendsms/${this.mobile}/1/${imgCode}`)
            .then(() => {
              this.$message({
                message: '发送成功',
                onClose: () => {
                  this.setCodeTime();
                  this.$store.dispatch(LOADING_CHANGE, { code: false });
                }
              });
            });
        } else {
          this.$refs.verifyRef.validateField('imgCode');
        }
      }, // 获取验证码
      setCodeTime() {
        this.verifyText = '60秒';
        let time = 60;
        const codeTime = setInterval(() => {
          time -= 1;
          if (time <= 0) {
            this.verifyText = '获取验证码';
            clearInterval(codeTime);
          } else {
            this.verifyText = `${time}秒`;
          }
        }, 1000);
      }, // 设置获取验证码间隔
      verify() {
        this.$refs.verifyRef.validate((valid) => {
          if (valid) {
            this.$store.dispatch(LOADING_CHANGE, { verify: true });
            this.$axios.get(`general/pub/check/${this.mobile}/${this.verifyData.vcode}`)
              .then(() => {
                this.$message({
                  message: '验证成功',
                  onClose: () => {
                    this.$store.dispatch(USER_SET, this.userData)
                      .then(() => {
                        this.$store.dispatch(USER_GET, false)
                          .then(() => {
                            if (this.user.loginCnt > 0) {
                              this.$router.push({ name: 'dashboard' });
                            } else {
                              this.$store.dispatch(USER_CLEAR);
                              this.$store.dispatch(USER_SET, this.userData);
                              this.dialog.verify = false;
                            }
                          });
                      });
                  }
                });
              });
          }
        });
      }, // 验证验证码
      amend() {
        this.$refs.amendRef.validate((valid) => {
          if (valid) {
            this.$store.dispatch(LOADING_CHANGE, { amend: true });
            const { oldPassword, newPassword } = this.amendData;
            this.$axios.put(`common/users/changePassword?oldPassword=${oldPassword}&newPassword=${newPassword}`)
              .then(() => {
                this.$message({
                  message: '修改成功',
                  onClose: () => {
                    this.$router.push({ name: 'dashboard' });
                  }
                });
              });
          }
        });
      } // 修改初始密码
    }
  };
</script>

<style lang="scss" scoped>
  @import "../../../styles/config";

  .login {
    position: absolute;
    width: 100%;
    height: 100%;

    #container {
      position: absolute;
      height: 100%;
      width: 100%;

      #output {
        width: 100%;
        height: 100%;
      }
    }

    .login-form, .amend-form {
      position: fixed;
      top: 50%;
      left: 50%;
      z-index: 997;
      width: 450px;
      padding: 30px;
      transform: translate(-50%, -65%);
      border-radius: 4px;

      .form-title {
        color: #fff;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        white-space: nowrap;
        margin-bottom: 40px;
      }

      .el-form .el-form-item {
        margin-bottom: 30px;

        &:last-child {
          margin-top: 40px;
          margin-bottom: 20px;
        }

        .el-form-item__content .el-button {
          width: 100%;
          height: 40px;
        }

        .el-button {
          color: #fff;
        }
      }

      .form-password {
        float: right;
        color: $hoverColor;
      }
    }

    .login-form .fa {
      color: $hoverColor;
    }

    .amend-form {
      z-index: 999;

      .form-title > span {
        color: #f56c6c;
      }
    }

    .amend-form-background {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 998;
      width: 100%;
      height: 100%;
      opacity: .5;
      background-color: #000;
    }

    .el-dialog .el-input {
      .query-button {
        top: 0;

        &.form-button-code {
          min-width: 110px;
          height: 40px;
        }

        &:not(.form-button-code) {
          height: 50px;
        }
      }
    }
  }
</style>

<style lang="scss">
  .login {
    .login-form, .amend-form {
      .el-form {
        &:not(.verify-form) .el-input__inner {
          height: 50px;
          line-height: 50px;
        }

        .el-input__inner {
          padding: 0 50px;
        }
      }

      .dialog-verify .el-dialog__header {
        text-align: center;

        .el-dialog__headerbtn {
          display: none;
        }
      }
    }
  }
</style>
