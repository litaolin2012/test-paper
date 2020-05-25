<template>
  <div class="login">
    <h3>实验操作考试</h3>
    <div v-show="false">
      <div id="baseContent" class="print-div">
        <div v-for="(item, index) in baseInfo" :key="index">
          <div class="base-content">
            <h3>
              <span>考场号 {{ item.roomName }} </span>
              <span>座位号 {{ item.seatSeq }}</span>
            </h3>
            <p>
              <span>学科：</span>
              <span>{{ item.subjectName }}</span>
            </p>
            <p>
              <span>姓名：</span>
              <span>{{ item.studentName }}</span>
            </p>
            <p>
              <span>场次：</span>
              <span>{{ item.sceneSeq }}</span>
            </p>
            <p>
              <span>考号：</span>
              <span>{{ item.studentCode }}</span>
            </p>
          </div>
          <div class="line-bottom">
          </div>
        </div>
      </div>
    </div>
    <div class="test-info">
      <input id="barcode" ref="barcode" v-model="barcode" class="draw-lots" placeholder="扫一扫" @blur="inputBlur" @keydown.native="preventInput"/>
      <h3 v-if="showBaseInfo">第{{ params.seq }}场考试 抽签进行中</h3>
      <div>
        <!-- <el-input ref="barcode" v-model="barcode" class="barcode" placeholder="扫一扫" @blur="inputBlur" @keydown.native="preventInput"></el-input> -->
        <div v-if="!showBaseInfo" class="open-draw-lots">
          <strong @click="testApi">扫描场次二维码开启抽签</strong>
        </div>
        <div v-if="showBaseInfo" class="barcode-info">
          <div v-for="(item, index) in baseInfo" :key="index">
            <div class="base-content">
              <h3>
                <span>考场号 {{ item.roomName }} </span>
                <span>座位号 {{ item.seatSeq }}</span>
              </h3>
              <p>
                <span>学科：</span>
                <span>{{ item.subjectName }}</span>
              </p>
              <p>
                <span>姓名：</span>
                <span>{{ item.studentName }}</span>
              </p>
              <p>
                <span>场次：</span>
                <span>{{ item.sceneSeq }}</span>
              </p>
              <p>
                <span>考号：</span>
                <span>{{ item.studentCode }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getExternalSceneDrawStatus, getExternalSceneDraw } from '@/api/base';
import printJS from 'print-js';
import { setTimeout } from 'timers';
export default {
  name: 'LoginCommon',
  data() {
    return {
      showBaseInfo: false,
      stopDrawLots: false,
      barcode: '',
      barcodeDom: null,
      hasTips: false,
      oldBarcode: '', // 2s内阻止重复或快速扫描
      baseInfo: [
        {
          roomName: '',
          seatSeq: '',
          subjectName: '',
          studentName: '',
          sceneSeq: '',
          studentCode: ''
        }
      ],
      params: {
        seq: ''
      }
    };
  },
  watch: {
    barcode() {
      if (!this.barcode) {
        return;
      }
      if (this.oldBarcode) {
        this.barcode = this.oldBarcode;
        if (!this.hasTips) {
          this.hasTips = true;
          // this.$message({
          //   message: '请稍后再扫描！',
          //   type: 'warning',
          //   duration: 1500
          // });
          setTimeout(() => {
            this.hasTips = false;
          }, 1500);
        }
      } else {
        if (this.barcode[this.barcode.length - 1] === '}') {
          this.oldBarcode = this.barcode;
          // 2s后可以重新获取扫描值
          setTimeout(() => {
            this.oldBarcode = '';
          }, 2000);
          this.getData();
        }
      }
    }
  },
  created() {
  },
  mounted() {
    this.barcodeDom = document.getElementById('barcode');
    this.barcodeDom.focus();
  },
  methods: {
    testApi() {
      getExternalSceneDrawStatus().then(res => {
        this.$message(`第${this.params.seq}场考试抽签开始`);
        this.showBaseInfo = true;
        this.barcode = '';
      }).catch(error => {
        console.log(error);
      });
    },
    getData() {
      if (!navigator.onLine) {
        this.$message({
          message: '当前处于未联网的状态！',
          type: 'warning',
          duration: 1500
        });
        return false;
      }
      const data = JSON.parse(this.barcode);
      if (!data.opType) {
        this.params.seq = data.seq;
        getExternalSceneDrawStatus(data).then(res => {
          this.$message(`第${this.params.seq}场考试抽签开始`);
          this.showBaseInfo = true;
          this.barcode = '';
        });
      } else {
        data.seq = this.params.seq;
        getExternalSceneDraw(data).then(res => {
          if (Array.isArray(res) && res.length) {
            this.baseInfo = res;
            this.$nextTick(() => {
              this.printPaper();
              setTimeout(() => {
                this.oldBarcode = '';
                this.barcode = '';
              }, 1500);
            });
          } else {
            this.baseInfo = [
              {
                roomName: '',
                seatSeq: '',
                subjectName: '',
                studentName: '',
                sceneSeq: '',
                studentCode: ''
              }
            ];
          }
        }).catch(error => {
          console.log(error, 333);
          this.$message({
            message: error.data.message,
            type: 'error',
            duration: 2000
          });
          this.oldBarcode = '';
          this.barcode = '';
        });
      }
    },

    printPaper() {
      printJS({
        printable: 'baseContent',
        type: 'html',
        targetStyles: ['*']
        // scanStyles: false,
        // css: 'print.css',
        // style: '.base-content { color: #333; width: 227pt; font-size: 12pt;}',
        // onPrintDialogClose: function() {
        //   console.log(2222);
        // }
      });
    },

    // 失去焦点事件
    inputBlur() {
      this.barcodeDom.focus();
    },
    preventInput(e) {
      e.preventDefault();
      return false;
    }
  }
};
</script>
<style lang="less" scoped>
.draw-lots {
  width: 462px;
  height: 36px;
  padding: 0 8px;
  margin-top: 4vh;
}
.open-draw-lots {
  margin: 6vh auto 0;
  width: 240px;
  height: 80px;
  line-height: 80px;
  text-align: center;
  font-size: 20px;
  border-radius: 8px;
  background: #fff;
  color: #333;
}
.login {
  color: #fff;
  &>h3 {
    font-weight: normal;
    font-size: 28px;
    padding-top: 6vh;
  }
  .test-info {
    width: 480px;
    margin: 40px auto 0;
    &>h3 {
      font-weight: normal;
      font-size: 32px;
      line-height: 3em;
    }
    div {
      // .barcode {
      //   opacity: 0;
      // }
      .barcode-info {
        margin-top: 40px;
        height: 300px;
        border: 1px dotted;
        .base-content {
          h3 {
            font-size: 24px;
            line-height: 2em;
            padding-top: 16px;
            text-align: center;
            span {
              padding: 0 8px;
            }
          }
          p {
            text-align: left;
            font-size: 24px;
            line-height: 2em;
            span {
              display: inline-block;
              &:first-child {
                width: 140px;
                text-align: right;
              }
            }
          }
        }
      }
    }
  }
}
.print-div {
  float: left;
  width: 228pt;
  font-size: 20px;
  color: #000;
  .line-bottom {
    height: 60px;
    border-bottom: 1px solid #666;
  }
  h3 {
    font-size: 24px;
    text-align: center;
    padding-bottom: 8px;
  }
  p {
    line-height: 2em;
    text-align: left;
    span {
      display: inline-block;
      &:first-child {
        width: 60pt;
        text-align: right;
      }
    }
  }
}
</style>
