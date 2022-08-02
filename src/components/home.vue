<template>
  <div class="productContainer">

    <div class="notice_page" :style="`height:${innerHeight}px`" v-show="showPage === 'Content' || showPage === 'Description' || showPage === 'PrivacyPolicy'">
      <div class="background" >
        <div class="close" @click="selectProduct = {} ; showPage = 'main';"> <i class="fa fa-times" aria-hidden="true"></i> </div>
        <div class="content ql-editor" ref='notice_page_content' v-html="unescapeHTML(store[showPage])"></div>
      </div>
    </div>

    <div class="cart" v-show="showPage === 'cart'" :style="`height:${innerHeight}px`">
      <div class="background" ref="cartScroll">
        <div class="close"> <i class="fa fa-times" aria-hidden="true" @click="selectProduct = {}; showPage = 'main'; stepIndex = 1; getProducts();"></i> </div>
        <div class="step">
          <div class="stepItem" :class="{stepItemActive:stepIndex === 1}">
            <div class="icon" >1</div>
            <p>確認購物車</p>
          </div>
          <div class="arrow" :class="{arrowActive:stepIndex === 1}"> <i class="fa fa-arrow-right" aria-hidden="true"></i> </div>
          <div class="stepItem" :class="{stepItemActive:stepIndex === 2}"> 
            <div class="icon">2</div>
            <p>付款與運送方式</p>
          </div>
          <div class="arrow" :class="{arrowActive:stepIndex === 2}"> <i class="fa fa-arrow-right" aria-hidden="true"></i> </div>
          <div class="stepItem" :class="{stepItemActive:stepIndex === 3}">
            <div class="icon">3</div>
            <p>完成訂單</p>
          </div>
        </div>

        <div class="stepOne" v-show="(cartsLength !== 0 )&& stepIndex === 1">
          <div class="table">
            <div class="thead">
              <div class="th picName">商品</div>
              <div class="th spec">規格</div>
              <div class="th price">單價</div>
              <div class="th qty">數量</div>
              <div class="th subtotal">小計</div>
              <div class="th delete"></div>
            </div>
            <div class="tbody">
              <template>
                <div v-for=" (item, index) in carts ">
                  <!-- 有規格 -->
                  <template v-if="item.specArr">
                    <div class="tr p-1" v-for="(spec, specIndex) in item.specArr " :key="spec.ID" v-show="spec.buyQty != 0 || spec.buyQty===''">
                      <div class="td picName jcs">
                        <div class="pic" :style="{backgroundImage :`url(${item.Img1})`}"></div>
                        <div class="name">{{item.Name}}</div>
                      </div>
                      <div class="td spec"> 
                        <div class="specButton" @click="cartsSpecCheckedId = cartsSpecCheckedId == spec.ID ? -1 : spec.ID"> 規格 <i :class="{iActive:cartsSpecCheckedId == spec.ID}" class="fa fa-caret-down" aria-hidden="true"></i>  </div>
                        <div class="specText" :class="{specTextShow:cartsSpecCheckedId == spec.ID}"> {{spec.Name}} </div>
                      </div>
                      <div class="td price"> NT$ {{item.NowPrice}} </div>
                      <div class="td qty">
                        <div class="qtyBox" v-show="store.Enable === '1'">
                          <div class="reduce" :class="{qtyDisabled:spec.buyQty<1}" @click="getAmount( 3,  spec.ID, updateCartsBuyQty_spec, [index, spec.buyQty-1, specIndex]);"><i class="fa fa-minus"></i></div>
                          <input class="number" size="3" @blur="getAmount( 3,  spec.ID, updateCartsBuyQty_spec, [index, spec.buyQty, specIndex])" 
                            @keyup.enter="getAmount( 3,  spec.ID, updateCartsBuyQty_spec, [index, spec.buyQty, specIndex])"
                            type="text" maxlength="3" @input="numberInput(spec)" v-model="spec.buyQty">
                          <div class="add" :class="{qtyDisabled:(spec.Enable == 1 && spec.buyQty > spec.Amount - 1) || spec.buyQty > 998 }" @click="getAmount( 3,  spec.ID, updateCartsBuyQty_spec, [index, spec.buyQty*1+1, specIndex]);"><i class="fa fa-plus"></i></div>
                        </div>
                        <div class="discontinued" v-show="store.Enable === '0'">停售中</div>
                      </div>
                      <div class="td subtotal"> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{item.NowPrice * (isNaN(spec.buyQty) ? 0 : spec.buyQty) }} </div>  </div>
                      <div class="td delete">
                        <div class="deleteButton" @click="getAmount( 3,  spec.ID, updateCartsBuyQty_spec, [index, 0, specIndex]);">
                          刪除
                        </div>
                      </div>
                    </div>
                  </template>
                  <!-- 沒有規格 -->
                  <template v-if="!item.specArr">
                    <div class="tr p-1" :key="item.ID" v-show="item.buyQty || item.buyQty===''">
                      <div class="td picName jcs">
                        <div class="pic" :style="{backgroundImage :`url(${item.Img1})`}"></div>
                        <div class="name">{{item.Name}}</div>
                      </div>
                      <div class="td spec">

                      </div>
                      <div class="td price">  NT$ {{item.NowPrice}} </div>
                      <div class="td qty"> 
                        <div class="qtyBox" v-show="store.Enable === '1'">
                          <div class="reduce" :class="{qtyDisabled:item.buyQty<1}" @click="getAmount( 1, item.ID, updateCartsBuyQty, [index, item.buyQty-1]);"><i class="fa fa-minus"></i></div>
                          <input class="number" size="3" type="text" maxlength="3" @input="numberInput( item )"  @blur="getAmount( 1, item.ID, updateCartsBuyQty, [index, item.buyQty])" 
                            @keyup.enter="getAmount( 1, item.ID, updateCartsBuyQty, [index, item.buyQty])"
                            v-model="item.buyQty">
                          <div class="add" :class="{qtyDisabled:(item.Enable == 1 && item.buyQty > item.Amount - 1) || item.buyQty > 998 }" @click="getAmount( 1,  item.ID, updateCartsBuyQty, [index, item.buyQty*1+1]);"><i class="fa fa-plus"></i></div>
                        </div>
                        <div class="discontinued" v-show="store.Enable === '0'">停售中</div>
                      </div>
                      <div class="td subtotal"> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{item.NowPrice * (isNaN(item.buyQty) ? 0 : item.buyQty)}}</div>  </div>
                      <div class="td delete">
                        <div class="deleteButton" @click="getAmount( 1,  item.ID, updateCartsBuyQty, [index, 0]);">
                          刪除
                        </div>
                      </div>
                    </div>
                  </template>

                  <template>
                    <div v-for=" (item2, index2) in item.addPrice ">
                      <!-- 有規格 -->
                      <template v-if="item2.specArr">
                        <div class="tr p-1" v-for="(spec2, specIndex2) in item2.specArr" :key="spec2.ID" v-show="spec2.buyQty!=0 || spec2.buyQty===''">
                          <div class="td picName jcs">
                            <div class="pic" :style="{backgroundImage :`url(${item2.Img})`}">
                              <div class="tag">加價購</div>
                            </div>
                            <div class="name">{{item2.Name}}</div>
                          </div>
                          <div class="td spec">
                            <div class="specButton" @click="cartsSpecCheckedId = cartsSpecCheckedId == spec2.ID ? -1 : spec2.ID"> 規格 <i :class="{iActive:cartsSpecCheckedId == spec2.ID}" class="fa fa-caret-down" aria-hidden="true"></i>  </div> 
                            <div class="specText" :class="{specTextShow:cartsSpecCheckedId == spec2.ID}"> {{spec2.Name}} </div>  
                          </div>
                          <div class="td price">  NT$ {{item2.Price}} </div>
                          <div class="td qty">
                            <div class="qtyBox" v-show="store.Enable === '1'">
                              <div class="reduce" :class="{qtyDisabled:spec2.buyQty<1}" @click="getAmount( 3,  spec2.ID, updateCartsAddpriceQty_spec, [item, index2,spec2.buyQty-1, specIndex2], item.ID);"><i class="fa fa-minus"></i></div>
                              <input class="number" size="3" type="text" maxlength="3" @input="numberInput( spec2 )"  @blur="getAmount( 3,  spec2.ID, updateCartsAddpriceQty_spec, [item, index2,spec2.buyQty, specIndex2], item.ID)" 
                                @keyup.enter="getAmount( 3,  spec2.ID, updateCartsAddpriceQty_spec, [item, index2,spec2.buyQty, specIndex2], item.ID)"
                                v-model="spec2.buyQty">
                              <div class="add" :class="{qtyDisabled: spec2.buyQty > itemTotalQty(item) - 1 || (spec2.Enable == 1 && spec2.buyQty> spec2.Amount - 1)  || spec2.buyQty > 998 }" @click="getAmount( 3,  spec2.ID, updateCartsAddpriceQty_spec, [item, index2,spec2.buyQty*1+1, specIndex2], item.ID); "><i class="fa fa-plus"></i></div>
                            </div>
                            <div class="discontinued" v-show="store.Enable === '0'">停售中</div>
                          </div>
                          <div class="td subtotal"> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{item2.Price * (isNaN(spec2.buyQty) ? 0 : spec2.buyQty) }} </div>  </div>
                          <div class="td delete">
                            <div class="deleteButton" @click="getAmount( 3,  spec2.ID, updateCartsAddpriceQty_spec, [item, index2, 0, specIndex2], item.ID); ">
                              刪除
                            </div>
                          </div>
                        </div>
                      </template>
                      <!-- 沒有規格 -->
                      <template v-if="!item2.specArr">
                        <div class="tr p-1" :key="item2.ID" v-show="item2.Qty!=0 || item2.Qty===''">
                          <div class="td picName jcs">
                            <div class="pic" :style="{backgroundImage :`url(${item2.Img})`}">
                              <div class="tag">加價購</div>
                            </div>
                            <div class="name"> {{item2.Name}} </div>
                          </div>
                          <div class="td spec"></div>
                          <div class="td price"> NT$ {{item2.Price}} </div>
                          <div class="td qty">
                            <div class="qtyBox" v-show="store.Enable == 1">
                              <div class="reduce" :class="{qtyDisabled:item2.Qty < 1}" @click="getAmount( 2,  item2.ID, updateCartsAddpriceQty, [item, index2, item2.Qty - 1], item.ID);"><i class="fa fa-minus"></i></div>
                              <input class="number" size="3" type="text" maxlength="3" @input="numberInput( item2 )"  @blur="getAmount( 2,  item2.ID, updateCartsAddpriceQty, [item, index2, item2.Qty], item.ID)" 
                                @keyup.enter="getAmount( 2,  item2.ID, updateCartsAddpriceQty, [item, index2, item2.Qty], item.ID)"
                                v-model="item2.Qty">
                              <div class="add" :class="{qtyDisabled:item2.Qty > itemTotalQty(item) - 1 || (item2.Enable == 1 && item2.Qty > item2.Amount - 1) || item2.Qty > 998 }" @click="getAmount( 2,  item2.ID, updateCartsAddpriceQty, [item, index2, item2.Qty*1 + 1], item.ID);"><i class="fa fa-plus"></i></div>
                            </div>
                            <div class="discontinued" v-show="store.Enable === '0'">停售中</div>
                          </div>
                          <div class="td subtotal"> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{item2.Price * (isNaN(item2.Qty) ? 0 : item2.Qty) }} </div> </div>
                          <div class="td delete">
                            <div class="deleteButton" @click="getAmount( 2,  item2.ID, updateCartsAddpriceQty, [item, index2, 0], item.ID);">
                              刪除
                            </div>
                          </div>
                        </div>
                      </template> 
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </div>

          <div class="discount">
            <h5 v-show="store.Discount == 1" style="color: red; white-space: nowrap">消費滿{{store.Price}}元 ，折扣{{store.Ratio}}元 。</h5>
            <h5 v-show="store.Discount == 2" style="color: red; white-space: nowrap">消費滿{{store.Price}}元 ，打{{(100 - store.Ratio) % 10 === 0 ? (100 - store.Ratio)/10 : 100 - store.Ratio }}折 。</h5>
            <p>如果要使用折扣碼，請在此填入</p>
            <div class="discountBox">
              <input type="text" v-model.trim="discountCode" @keyup.enter="discount">
              <div class="button" @click="discount">使用折扣碼</div>
            </div>
            <div class="discountError" v-if="isDiscountMessage">{{discountMessage}}</div>
          </div>

          <div class="total" v-show="total">
            <ul>
              <li>
                <div class="before">商品金額</div>
                <div class="after">NT$ {{total.Total}}</div>
              </li>
              <!-- <li>
                <div class="before">+ 運費</div>
                <div class="after">NT$ {{total.Shipping}}</div>
              </li> -->
              <li>
                <div class="before">- 折扣</div>
                <div class="after">NT$ {{total.Discount}}</div>
              </li>
              <li>
                <div class="before">- 折扣碼優惠</div>
                <div class="after">NT$ {{total.DiscountCode}}</div>
              </li>
              <li>
                <div class="before">= 金額總計</div>
                <div class="after">NT$ {{total.Sum}}</div>
              </li>
            </ul>
          </div>
          <!-- transport = store.Shipping==='0' ? '0' : store.Shipping==='3' ? '2' : '1' ; -->
          <div class="next" @click="stepOneToTwo()">下一步</div>
        </div>

        <div class="stepTwo" v-show="(cartsLength !== 0 )&& stepIndex === 2">
          <div class="title">
            填寫購買人資訊
          </div>
          <form class="info">
            <div class="left">
              <label for="email">購買人Email</label>
              <input type="text" id="email" name="email" v-validate="'required|email'" placeholder="email"
                :class="{inputError:errors.first('email')}" v-model="info.purchaser_email"
              >
              <div class="prompt">{{ errors.first('email') }}</div>
              <label for="name">購買人姓名</label>
              <input type="text" id="name" name="姓名" :class="{inputError:errors.first('姓名')}" v-validate="'required'" placeholder="姓名" v-model="info.purchaser_name" @change="pInput">
              <div class="prompt">{{ errors.first('姓名') }}</div>
              <label for="phone">購買人聯絡電話</label>
              <input type="text" id="phone" name="聯絡電話" :class="{inputError:errors.first('聯絡電話')}" v-validate="'required'" placeholder="聯絡電話" v-model="info.purchaser_number" @change="pInput">
              <div class="prompt">{{ errors.first('聯絡電話') }}</div>

              <div class="box">
                <input type="checkbox" id="isSame" v-model="isSame">
                <label for="isSame">購買人同收件人資料</label>
              </div>
              
              <label for="rname">收件人姓名</label>
              <input type="text" id="rname" name="收件人姓名" :class="{inputError:errors.first('收件人姓名')}" v-validate="'required'" placeholder="姓名" v-model="info.receiver_name">
              <div class="prompt">{{ errors.first('收件人姓名') }}</div>
              <label for="rphone">收件人聯絡電話</label>
              <input type="text" id="rphone" name="收件人聯絡電話" :class="{inputError:errors.first('收件人聯絡電話')}" v-validate="'required'" placeholder="聯絡電話" v-model="info.receiver_number">
              <div class="prompt">{{ errors.first('收件人聯絡電話') }}</div>

            </div>

            <div class="right">
              <label for="transport">運送方式</label>
              <select id="transport" v-model="transport" name="運送方式" :class="{inputError:transport === '0'}">
                <option value="0" disabled >=== 請選擇配送方式 ===</option>
                <option value="1" v-if="store.Shipping === '1' || store.Shipping === '2'" selected>一般宅配</option>
                <option value="2" v-if="store.Shipping === '1' || store.Shipping === '3'" selected>到店自取</option>
              </select>
              <div class="prompt" v-if="transport === '0'"> 請選擇配送方式 </div>

              <label for="pay_type">支付方式</label>
              <select id="pay_type" v-model="pay_type" name="支付方式" :class="{inputError:pay_type === '0'}">
                <option value="0" disabled >=== 請選擇支付方式 ===</option>
                <option value="1" v-if="store.LinePay == 1" selected>LINE Pay</option>
                <option value="2" v-if="store.ECPay == 1" selected>綠界科技 ECPay</option>
              </select>
              <div class="prompt" v-if="pay_type === '0'"> 請選擇支付方式 </div>

              <template v-if="transport == '1'">
                <label for="raddress">收件地址</label>
                <input type="text" id="raddress" name="收件地址" :class="{inputError:errors.first('收件地址')}" v-validate="'required'" placeholder="收件地址" v-model="info.receiver_address">
                <div class="prompt">{{ errors.first('收件地址') }}</div>
              </template>
              <label for="feedback">留言給我們</label>
              <textarea name="" id="feedback" cols="30" rows="5" placeholder="留言給我們" v-model="info.info_message" @input="info_message_input"></textarea>
              <div class="info_messageLength"> {{info.info_message.length}}/150 </div>

              <template v-if="store.Receipt === '1'">
                <label for="invoice_type">發票類型</label>
                <select id="invoice_type" v-model="invoice_type" name="發票類型">
                  <option value="0" disabled >=== 請選擇發票類型 ===</option>
                  <option value="1" >二聯</option>
                  <option value="2" >三聯</option>
                </select>
                <div class="prompt" v-if="invoice_type === '0'"> 請選擇發票類型 </div>

                <template v-if="invoice_type==='2'">
                  <label for="invoice_title">公司抬頭</label>
                  <input type="text" id="invoice_title" name="公司抬頭" placeholder="公司抬頭" v-model="invoice_title">
                  <div class="prompt" v-if="invoice_title === ''"> 請填寫公司抬頭 </div>
                  <label for="invoice_uniNumber">統一編號</label>
                  <input type="text" id="invoice_uniNumber" name="統一編號" placeholder="統一編號" v-model="invoice_uniNumber">
                  <div class="prompt" v-if="invoice_uniNumber === ''"> 請填寫統一編號 </div>
                </template>
              </template>

            </div>
          </form>

          <div class="total">
            <ul>
              <li>
                <div class="before">商品金額</div>
                <div class="after">NT$ {{total.Total}}</div>
              </li>
              <li>
                <div class="before">- 折扣</div>
                <div class="after">NT$ {{total.Discount}}</div>
              </li>
              <li>
                <div class="before">- 折扣碼優惠</div>
                <div class="after">NT$ {{total.DiscountCode}}</div>
              </li>
              <li>
                <div class="before">+ 運費</div>
                <div class="after">NT$ {{total.Shipping}}</div>
              </li>
              <li>
                <div class="before">= 金額總計</div>
                <div class="after">NT$ {{total.Sum}}</div>
              </li>
            </ul>
          </div>
          
          <div class="buttonGroup">
            <div class="button" @click="stepIndex = 1; getProducts()">上一步</div>
            <div class="button" @click="checkOrder()"><i  v-show="orderIng" class="fas fa-spinner fa-spin" style="margin-right: 5px"></i>完成訂單</div>
          </div>
        </div>

        <div class="noItem" v-show="cartsLength === 0">
          <p>購物車沒有內容</p>  
          <div class="button" @click="showPage='main'">back</div>
        </div>

        <div class="footer">
          <div class="top"></div>
          <div class="bottom">POWERED AND SECURED BY HONG BO</div>
        </div>
      </div>
    </div>

    <div class="selectProduct" v-if="showPage === 'selectProduct'" :style="`height:${innerHeight}px`">
      <div class="background">
        <div class="close" @click="selectProduct = {} ; showPage = 'main' ;"> <i class="fa fa-times" aria-hidden="true"></i> </div>
        <div class="picContent">
          <div class="pic" ref="allPicWidth">
            <div class="mainPic" :style="{backgroundImage :`url(${selectProduct.imgArr[selectProduct.mainImgIndex]})`}">
            </div>
            <div class="allPic" :style="{height:`${allPicHeight}px`}">
              <ul :style="`left: -${allPicUlleft * liWidth}px; width: ${selectProduct.allPicLength * liWidth}px;`" >
                <li ref='liItem' v-for = " (item, index) in (selectProduct.imgArr) " :key="`${item}_${index}`" 
                  @click=" selectProduct.mainImgIndex = index ;"
                  v-show="item" 
                >
                  <div class="img" :style="{backgroundImage :`url(${item})`, width: `${picWidth}px`}"
                      :class="{imgActive:selectProduct.mainImgIndex === index}">
                  </div>
                </li>
              </ul>
            </div>
            <div class="controller" :style="{height:`${allPicHeight}px`}">
              <div class="left" :class="{disabled:allPicUlleft - 1 < 0}" @click=" allPicUlleft - 1 < 0 ? allPicUlleft : allPicUlleft -= 1"> <i class="fa fa-chevron-left" aria-hidden="true"></i> </div>
              <div class="right" :class="{disabled:allPicUlleft + 1 > selectProduct.allPicLength - 3}" @click=" allPicUlleft + 1 > selectProduct.allPicLength - 3? allPicUlleft : allPicUlleft += 1"> <i class="fa fa-chevron-right" aria-hidden="true"></i> </div>
            </div>
          </div>
          <div class="content">
              <div class="title">{{selectProduct.Name}}</div>
              <div class="price" style="color:#9e9e9e; text-decoration: line-through; font-size:14px">NT$ {{selectProduct.Price}}</div>
              <div class="price">NT$ {{selectProduct.NowPrice}}</div>
              <div class="title"> <div v-html="unescapeEnter(selectProduct.Content)"></div> </div>

              <!-- 有規格 -->
              <template v-if="selectProduct.specArr">
                <div class="spec">
                  <div tabindex="0" class="select" @click="selectProduct.isShowOption = selectProduct.isShowOption == 1 ? 0 : 1" @blur="selectProduct.isShowOption = 0"> 
                    <div class="text">{{selectProduct.selectSpecItem.Name ? selectProduct.selectSpecItem.Name : "請選擇規格" }}</div>
                    <div class="icon" :class="{iconActive:selectProduct.isShowOption === 1}"> <i class="fa fa-caret-down" aria-hidden="true"></i> </div>
                    <ul class="option" :class="{showOption:selectProduct.isShowOption === 1}">                                                               
                      <li v-for="(option,index2) in selectProduct.specArr" :key="option.ID" @click.stop="selectSpec(selectProduct, index2);">
                        {{option.Name}}
                      </li>
                    </ul>
                  </div>
                </div> 
              
                <div class="qtyBox" v-show="selectProduct.selectSpecIndex != -1  && store.Enable == 1 && ( selectProduct.selectSpecItem.Enable == 0 || (selectProduct.selectSpecItem.Enable == 1 && selectProduct.selectSpecItem.Amount != 0) )">
                  <div class="reduce" :class="{qtyDisabled:selectProduct.selectSpecItem.buyQty<1}" @click="getAmount( 3,  selectProduct.selectSpecItem.ID, updateProductsBuyQty_spec, [selectIndex, selectProduct.selectSpecItem.buyQty-1, selectProduct.selectSpecIndex,'']); "><i class="fa fa-minus"></i></div>
                  <input class="number" size="3" type="text" maxlength="3" @input="numberInput( selectProduct.selectSpecItem )"  @blur="getAmount( 3,  selectProduct.selectSpecItem.ID, updateProductsBuyQty_spec, [selectIndex, selectProduct.selectSpecItem.buyQty, selectProduct.selectSpecIndex,''])" 
                    @keyup.enter="getAmount( 3,  selectProduct.selectSpecItem.ID, updateProductsBuyQty_spec, [selectIndex, selectProduct.selectSpecItem.buyQty, selectProduct.selectSpecIndex,''])"
                    v-model="selectProduct.selectSpecItem.buyQty">
                  <div class="add" :class="{qtyDisabled:(selectProduct.selectSpecItem.Enable == 1 && selectProduct.selectSpecItem.buyQty > selectProduct.selectSpecItem.Amount - 1) || selectProduct.selectSpecItem.buyQty > 998 }" @click="getAmount( 3,  selectProduct.selectSpecItem.ID, updateProductsBuyQty_spec, [selectIndex, selectProduct.selectSpecItem.buyQty*1+1, selectProduct.selectSpecIndex,'']); "><i class="fa fa-plus"></i></div>
                </div>
                <div class="qtyBox_fake" v-show="!(selectProduct.selectSpecItem.Enable == 1 && selectProduct.selectSpecItem.Amount == 0) && !( selectProduct.selectSpecIndex != -1  && store.Enable == 1 && ( selectProduct.selectSpecItem.Enable == 0 || (selectProduct.selectSpecItem.Enable == 1 && selectProduct.selectSpecItem.Amount != 0) ) )">
                  <div class="reduce"><i class="fa fa-minus"></i></div>
                  <input class="number" size="3" type="text" maxlength="3" value="0" disabled>
                  <div class="add"><i class="fa fa-plus"></i></div>
                </div>
                <div class="discontinued" v-show="store.Enable === '0'">停售中</div>
                <div class="discontinued" v-show="selectProduct.selectSpecItem.Enable == 1 && selectProduct.selectSpecItem.Amount == 0">暫無庫存</div> 
              </template>
              <!-- 沒規格 -->
              <template v-if="!selectProduct.specArr">
                <div class="noSpec"></div>
                <div class="qtyBox" v-show=" store.Enable == 1 && ( selectProduct.Enable == 0 || (selectProduct.Enable == 1 && selectProduct.Amount != 0) )">
                  <div class="reduce" :class="{qtyDisabled:selectProduct.buyQty<1}" @click="getAmount( 1,  selectProduct.ID, updateProductsBuyQty, [selectIndex, selectProduct.buyQty-1,'']);  "><i class="fa fa-minus"></i></div>
                  <input class="number" size="3" type="text" maxlength="3" @input="numberInput_2"  @blur="getAmount( 1,  selectProduct.ID, updateProductsBuyQty, [selectIndex, selectProduct.buyQty,''])" 
                    @keyup.enter="getAmount( 1,  selectProduct.ID, updateProductsBuyQty, [selectIndex, selectProduct.buyQty,''])"
                    v-model="selectProduct.buyQty">
                  <div class="add" :class="{qtyDisabled:(selectProduct.Enable == 1 && selectProduct.buyQty > selectProduct.Amount - 1) || selectProduct.buyQty > 998 }" @click="getAmount( 1,  selectProduct.ID, updateProductsBuyQty, [selectIndex, selectProduct.buyQty*1+1,'']); "><i class="fa fa-plus"></i></div>
                </div>
                <div class="discontinued" v-show="store.Enable === '0'">停售中</div>
                <div class="discontinued" v-show="selectProduct.Enable == 1 && selectProduct.Amount == 0">暫無庫存</div>
              </template>

              <div class="goToCart" v-if="(selectProduct.specArr && selectProduct.selectSpecIndex != -1 && selectProduct.selectSpecItem.buyQty != 0 ) || (!selectProduct.specArr && selectProduct.buyQty != 0)" @click="getProducts(); showPage='cart'">
                加入購物車
              </div>
          </div>
        </div>

        <div class="addPrice" v-if="selectProduct.addPrice && selectProduct.addPrice.length">
          <div class="title">加價購</div>
          <ul>
            <div class="ulMask" v-if=" (!selectProduct.specArr && selectProduct.Enable == 1 && selectProduct.Amount == 0) || (selectProduct.specArr && selectProduct.selectSpecItem.Enable == 1 && selectProduct.selectSpecItem.Amount == 0) "></div>
            <li v-for="(item,index) in selectProduct.addPrice" :key="item.ID">
              <div class="pic_div">
                <div class="pic" :style="{backgroundImage :`url(${item.Img})`,}"></div>
              </div>
              <div class="content">
                <div class="title">{{item.Name}}</div>
                <div class="price">NT$ {{item.Price}}</div>
                
                <!-- 有規格 -->
                <template v-if="item.specArr">
                  <div class="spec">
                    <div tabindex="0" class="select" @click="item.isShowOption = item.isShowOption == 1 ? 0 : 1" @blur="item.isShowOption = 0"> 
                      <div class="text"> {{item.selectSpecItem.Name ? item.selectSpecItem.Name : "請選擇規格" }}  </div>
                      <div class="icon" :class="{iconActive:item.isShowOption === 1}"> <i class="fa fa-caret-down" aria-hidden="true"></i> </div>
                      <ul class="option" :class="{showOption:item.isShowOption === 1}">                                                                  
                        <li v-for="(option,index2) in item.specArr" :key="option.ID" @click.stop="selectSpec(item, index2);">
                          {{option.Name}}
                        </li>
                      </ul>
                    </div>
                  </div> 

                  <div class="qtyBox" v-show="item.selectSpecIndex != -1  && store.Enable == 1 && ( item.selectSpecItem.Enable == 0 || (item.selectSpecItem.Enable == 1 && item.selectSpecItem.Amount != 0) )">
                    <div class="reduce" :class="{qtyDisabled:item.selectSpecItem.buyQty<1}" @click="getAmount( 3,  item.selectSpecItem.ID, updateProductsAddpriceQty_spec, [selectProduct, index, item.selectSpecItem.buyQty-1, item.selectSpecIndex], selectProduct.ID); "><i class="fa fa-minus"></i></div>
                    <input class="number" size="3" type="text" maxlength="3" @input="numberInput( item.selectSpecItem )"  @blur="getAmount( 3,  item.selectSpecItem.ID, updateProductsAddpriceQty_spec, [selectProduct, index, item.selectSpecItem.buyQty, item.selectSpecIndex], selectProduct.ID)" 
                      @keyup.enter="getAmount( 3,  item.selectSpecItem.ID, updateProductsAddpriceQty_spec, [selectProduct, index, item.selectSpecItem.buyQty, item.selectSpecIndex], selectProduct.ID)"
                      v-model="item.selectSpecItem.buyQty" :disabled="itemTotalQty(selectProduct) < 1">
                    <div class="add" :class="{qtyDisabled: item.selectSpecItem.buyQty > itemTotalQty(selectProduct) - 1 || (item.selectSpecItem.Enable == 1 && item.selectSpecItem.buyQty > item.selectSpecItem.Amount - 1) || item.selectSpecItem.buyQty > 998 }" @click="getAmount( 3,  item.selectSpecItem.ID, updateProductsAddpriceQty_spec, [selectProduct, index, item.selectSpecItem.buyQty*1+1, item.selectSpecIndex], selectProduct.ID); "><i class="fa fa-plus"></i></div>
                  </div>
                  <div class="qtyBox_fake" v-show="!(item.selectSpecItem.Enable == 1 && item.selectSpecItem.Amount == 0) && !( item.selectSpecIndex != -1  && store.Enable == 1 && ( item.selectSpecItem.Enable == 0 || (item.selectSpecItem.Enable == 1 && item.selectSpecItem.Amount != 0) ) )">
                    <div class="reduce"><i class="fa fa-minus"></i></div>
                    <input class="number" size="3" type="text" maxlength="3" value="0" disabled>
                    <div class="add"><i class="fa fa-plus"></i></div>
                  </div>
                  <div class="discontinued" v-show="store.Enable === '0'">停售中</div>
                  <div class="discontinued" v-show="item.selectSpecItem.Enable == 1 && item.selectSpecItem.Amount == 0">暫無庫存</div> 
                </template>
                <!-- 沒有規格 -->
                <template v-if="!item.specArr">
                  <div class="noSpec"></div>
                  <div class="qtyBox" v-show="store.Enable == 1 && ( item.Enable == 0 || (item.Enable == 1 && item.Amount != 0) )">
                    <div class="reduce" :class="{qtyDisabled:item.Qty < 1}" @click="getAmount( 2,  item.ID, updateProductsAddpriceQty, [selectProduct, index, item.Qty - 1], selectProduct.ID);"><i class="fa fa-minus"></i></div>
                    <input class="number" size="3" @blur="getAmount( 2,  item.ID, updateProductsAddpriceQty, [selectProduct, index, item.Qty], selectProduct.ID)" 
                      @keyup.enter="getAmount( 2,  item.ID, updateProductsAddpriceQty, [selectProduct, index, item.Qty], selectProduct.ID)"
                      type="text" maxlength="3" @input="numberInput(item)"  v-model="item.Qty" :disabled="itemTotalQty(selectProduct) < 1">
                    <div class="add" :class="{qtyDisabled:item.Qty > itemTotalQty(selectProduct) - 1 || (item.Enable == 1 && item.Qty > item.Amount - 1) || item.Qty > 998 }" @click="getAmount( 2,  item.ID, updateProductsAddpriceQty, [selectProduct, index, item.Qty*1 + 1], selectProduct.ID);  "><i class="fa fa-plus"></i></div>
                  </div>
                  <div class="discontinued" v-show="store.Enable == 0">停售中</div>
                  <div class="discontinued" v-show="item.Enable == 1 && item.Amount == 0">暫無庫存</div>
                </template>
              </div>
            </li>
          </ul>
        </div>

        <div class="detail">
          <div class="title">商品詳情</div>
          <div class="content ql-editor" ref='selectProduct_detail_content' v-html="unescapeHTML(selectProduct.Detail)"></div>
        </div>
      </div>
    </div>

    <div class="flyImg" :style="`top: ${flyImgTop}px; left: ${flyImgLeft}px`" v-if="pageFilterProduct[flyImgIndex]" v-show="showflyImg">
      <img :src="pageFilterProduct[flyImgIndex].Img1" alt="">
    </div>
    <div class="cartIcon" :class="{cartIconScale:cartIconScale}"  v-show="showPage === 'main'" @click="getProducts(); showPage = 'cart';">
      <i class="fa fa-shopping-cart fa-2x" aria-hidden="true"></i>
      <div class="num">
        {{cartsLength}}
      </div>
    </div>

    <div class="message_container">
      <div v-for="item in  messageArr" :key="item.id" 
          class="message" :class="{ messageActive:item.messageActive, messagefadeout:item.messagefadeout}" 
          :ref="`m${item.id}`" 
          :style="`background:${item.isSuccess ? 'rgba(50, 200, 50, 0.6)' : 'rgba(255, 0, 0, 0.6)'}`"> 
          {{ item.messageStr }}
      </div>
    </div>

    <div class="confirm" v-if="isConfirm">
      <div class="frame">
        <div class="border"></div>
        <i class="fa fa-check-circle fa-2x" aria-hidden="true"></i>
        <div class="message"> 訂單完成，按確定前往付款頁面 </div>
        <div class="buttonGroup">
          <!-- <div class="button cancel" @click="clearCarts(); isConfirm = false;"> 取消  </div> -->
          <div class="button determine" @click="toPay()"> 確定  </div>
        </div>
      </div>
    </div>

    <div class="confirm" v-if="isConfirm2">
      <div class="frame">
        <div class="border"></div>
        <i class="fa fa-question-circle fa-2x" aria-hidden="true"></i>
        <div class="message"> 該mail已使用過折扣碼，按確定取消折扣碼優惠直接完成訂單，按取消重新輸入email或折扣碼 </div>
        <div class="buttonGroup">
          <div class="button cancel" @click=" isConfirm2 = false;"> 取消 </div>
          <div class="button determine" @click="cancelDiscountCodeCreateOrder()"> 確定  </div>
        </div>
      </div>
    </div>

    <div class="main" v-if="showPage === 'main'">
      <div class="logo_name">
        <img :src="store.Logo" class="logo" v-if="store.Logo" @click="urlPush('/')">
      </div>
      <div class="categories">
        <ul>
          <li v-for="item in categories" :key="item.ID" 
              :class="{categoryActive:item.ID === category}"
              @click="category = item.ID; currentPage = 1;" 
          >
            {{item.Name}}
          </li>
        </ul>
      </div>
      <div class="arrangement" v-if="pageFilterProduct.length !== 0">
        <div>排列方式</div>
        <div class="icon"
          :class="{iconActive:arrangement==0}"
          @click="arrangement=0" 
        >
          <i class="fa fa-th-large" aria-hidden="true"></i>
        </div>
        <div class="icon"
          :class="{iconActive:arrangement==1}"
          @click="arrangement=1"
        >
          <i class="fa fa-th-list" aria-hidden="true"></i>
        </div>
        <div class="icon"
          style=" opacity:0 "
          @dblclick="isConfirm=true"
        >
          <i class="fa fa-th-list" aria-hidden="true"></i>
        </div>
      </div>

      <div class="products" :class="{change:arrangement==1}">
        <ul>
          <li v-for="(item, index) in pageFilterProduct" :key="item.ID" >
            <div class="pic_div">
              <div class="pic" ref='picWidth' :style="{backgroundImage :`url(${item.Img1})`, height:`${picHeight}px`}" @click="showSelect(item, index)">
                <div class="detailButton">查看詳情</div>
              </div>
            </div>

            <div class="content">
              <div class="title">{{item.Name}}</div>
              <div class="price" style="color:#9e9e9e; text-decoration: line-through; font-size:14px">NT$ {{item.Price}}</div>
              <div class="price">NT$ {{item.NowPrice}}</div>
              <!-- 有規格 -->
              <template v-if="item.specArr">
                <div class="spec">
                  <div tabindex="0" class="select" @click="item.isShowOption = item.isShowOption == 1 ? 0 : 1" @blur="item.isShowOption = 0"> 
                    <div class="text"> {{item.selectSpecItem.Name ? item.selectSpecItem.Name : "請選擇規格" }} </div>
                    <div class="icon" :class="{iconActive:item.isShowOption === 1}"> <i class="fa fa-caret-down" aria-hidden="true"></i> </div>
                    <ul class="option" :class="{showOption:item.isShowOption === 1}">                                                                  
                      <li v-for="(option,index2) in item.specArr" :key="option.ID" @click.stop="selectSpec(item, index2);">
                        {{option.Name}}
                      </li>
                    </ul>
                  </div>
                </div> 
                
                <div class="qtyBox" v-if="item.selectSpecIndex != -1  && store.Enable == 1 && ( item.selectSpecItem.Enable == 0 || (item.selectSpecItem.Enable == 1 && item.selectSpecItem.Amount != 0) )">
                  <div class="reduce" :class="{qtyDisabled:item.selectSpecItem.buyQty<1}" @click="getAmount( 3,  item.selectSpecItem.ID, updateProductsBuyQty_spec, [index, item.selectSpecItem.buyQty-1, item.selectSpecIndex, $event]);"><i class="fa fa-minus"></i></div>
                  <input class="number" size="3" @blur="getAmount( 3,  item.selectSpecItem.ID, updateProductsBuyQty_spec, [index, item.selectSpecItem.buyQty, item.selectSpecIndex, ''])" 
                    @keyup.enter="getAmount( 3,  item.selectSpecItem.ID, updateProductsBuyQty_spec, [index, item.selectSpecItem.buyQty, item.selectSpecIndex, ''])"
                    type="text" maxlength="3" @input="numberInput(item.selectSpecItem)"  v-model="item.selectSpecItem.buyQty">
                  <div class="add" :class="{qtyDisabled:(item.selectSpecItem.Enable == 1 && item.selectSpecItem.buyQty > item.selectSpecItem.Amount - 1) || item.selectSpecItem.buyQty > 998 }" @click="getAmount( 3,  item.selectSpecItem.ID, updateProductsBuyQty_spec, [index, item.selectSpecItem.buyQty+1, item.selectSpecIndex, $event]);"><i class="fa fa-plus"></i></div>
                </div>
                <div class="qtyBox_fake" v-if="!(item.selectSpecItem.Enable == 1 && item.selectSpecItem.Amount == 0) && !(item.selectSpecIndex != -1  && store.Enable == 1 && ( item.selectSpecItem.Enable == 0 || (item.selectSpecItem.Enable == 1 && item.selectSpecItem.Amount != 0)))">
                  <div class="reduce"><i class="fa fa-minus"></i></div>
                  <input class="number" size="3" type="text" maxlength="3" value="0" disabled>
                  <div class="add"><i class="fa fa-plus"></i></div>
                </div>

                <div class="discontinued" v-show="store.Enable === '0'">停售中</div>
                <div class="discontinued" v-show="item.selectSpecItem.Enable == 1 && item.selectSpecItem.Amount == 0">暫無庫存</div> 
              </template>
              <!-- 沒規格 -->
              <template v-if="!item.specArr">
                <div class="noSpec"></div>
                <div class="qtyBox" v-show="store.Enable == 1 && ( item.Enable == 0 || (item.Enable == 1 && item.Amount != 0) )">
                  <div class="reduce" :class="{qtyDisabled:item.buyQty<1}" @click="getAmount( 1,  item.ID, updateProductsBuyQty, [index, item.buyQty-1, $event]); "><i class="fa fa-minus"></i></div>
                  <input class="number" size="3" @blur="getAmount( 1,  item.ID, updateProductsBuyQty, [index, item.buyQty, ''])" 
                    @keyup.enter="getAmount( 1,  item.ID, updateProductsBuyQty, [index, item.buyQty, ''])"
                    type="text" maxlength="3" @input="numberInput_2"  v-model="item.buyQty">
                  <div class="add" :class="{qtyDisabled:(item.Enable == 1 && item.buyQty > item.Amount - 1) || item.buyQty > 998 }" @click="getAmount( 1,  item.ID, updateProductsBuyQty, [index, item.buyQty*1+1, $event]); "><i class="fa fa-plus"></i></div>
                </div>
                <div class="discontinued" v-show="store.Enable === '0'">停售中</div>
                <div class="discontinued" v-show="item.Enable == 1 && item.Amount == 0">暫無庫存</div>
              </template>
            </div>
          </li>
        </ul>
        <div class="no_item" v-if="productCompleted && pageFilterProduct.length === 0">
          目前沒有銷售任何產品
        </div>
      </div>

      <div class="pages" v-if="pageFilterProduct.length !== 0">
        <ul>
          <li :class="{'pageDisabled':currentPage===1}" @click="pageChange(currentPage-1)">
            Previous
          </li>
    
          <li v-for="page in totalPage" :key="`page_${page}`" 
              :class="{'liActive':currentPage===page}"
              @click="pageChange(page)">
            {{page}}
          </li>
    
          <li :class="{'pageDisabled':currentPage===totalPage}" @click="pageChange(currentPage+1)">
            Next
          </li>
        </ul>
      </div>
      <div class="notice">
        <ul>
          <li v-if="store.Content" @click="showPage = 'Content'">
            訂購須知
          </li>
          <li v-if="store.Description" @click="showPage = 'Description'">
            配送須知
          </li>
          <li v-if="store.PrivacyPolicy" @click="showPage = 'PrivacyPolicy'">
            隱私權聲明
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      site: {},
      store: {},
      categories: [],
      products: [],

      productCompleted: false,

      carts: [],

      category: '',
      arrangement: 0,

      totalPage: 0,
      pageNum: 12,
      currentPage: 1,

      showPage: 'main',

      selectProduct: {},
      selectIndex: 1,

      showflyImg: 0,
      cartIconScale: 0,
      flyImgIndex: 0,
      flyImgTop: 0,
      flyImgLeft: 0,

      cartsLength: 0,
      cartsSLength: 0,
      cartsSpecCheckedId: -1,

      messageArr: [],
      isShowMessage: true,

      stepIndex: 1,
      isDiscountMessage: false,
      discountMessage: '',
      discountCode: '',
      useCodeSuccess: '',
      total: {},
      isSame: false,
      transport: '0',// 一般宅配2 到店自取3
      pay_type: '0', // 支付方式 1: Line 2: EC
      info: {
        purchaser_email:'',
        purchaser_name:'',
        purchaser_number:'',
        receiver_name:'',
        receiver_number:'',
        receiver_address:'',
        info_message:''
      },
      invoice_type: '0',
      invoice_title: '',
      invoice_uniNumber: '',
      orderIng: false,

      isConfirm: false,
      isConfirm2: false,
      payResult: {},
      
      //  
      innerHeight: 0,
      picHeight: 0,
      allPicHeight: 0,

      // 
      allPicUlleft: 0,
      liWidth: 0,
      picWidth: 0,

      api: '',
      protocol: ''
    }
  },
  watch:{
    // this.info
    isSame(v){
      if(v){
        this.info.receiver_name = this.info.purchaser_name;
        this.info.receiver_number = this.info.purchaser_number;
      } else {
        this.info.receiver_name = ''
        this.info.receiver_number = '';
      }
    },
    // this.getTotal(1)
    transport(v){
      this.getTotal(1);
    },
    // selectProduct
    showPage(v){
      if( v === 'selectProduct'){
        this.$nextTick(() => {
          this.computedLiLength();
          this.computedVideoWidth(v);
        })
      }
      if( v === 'Content' || v === 'Description' || v === 'PrivacyPolicy' ){
        this.$nextTick(() => {
          this.computedVideoWidth(v);
        })
      }
    },
  },
  computed:{
    filterProducts() {
      const vm = this;
      let arr = [];
      if(vm.category === '0'){
        arr = vm.products;
      } else {
        vm.products.forEach(p => {
          if(p.categoryArr){
            for(let i = 0; i < p.categoryArr.length; i++){
              if(p.categoryArr[i] === vm.category){
                arr.push(p);
                break;
              }
            }
          }
        })
      }
      vm.totalPage = Math.ceil(arr.length / vm.pageNum);
      return arr;
    },
    pageFilterProduct(){
      let arr = [];
      let start;
      this.filterProducts.forEach((p,i)=> {
        start = (this.currentPage - 1) * this.pageNum;
        if( start <= i &&  i <= start + this.pageNum - 1 ){
          arr.push(p);
        }
      })
      return arr;
    },
  },
  methods: {
    login(func, arr){
      this.site = JSON.parse(localStorage.getItem('site')) || [] ;
      let o = `site=${this.site.Site}&store=${this.site.Name}&Preview=${this.site.Preview}&WebPreview=${this.site.WebPreview}`;
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
      const url = `${this.protocol}//${this.api}/interface/store/UserLogin`
      this.$http.post(url, o, config).then((res) => {
        if(func){
          if(arr){
            func(...arr);
          }
          else {
            func();
          }
        }
      })
      .catch((err) => { console.error(err) });
    },
    getSite(){
      const vm = this;

      localStorage.setItem('isGetSite', false);
      const url = `${vm.protocol}//${vm.api}/interface/store/GetSite`;
      this.$http.get(url).then((res) => {
        if(res.data.errormessage){
          vm.login(vm.getSite);
          return;
        }
        localStorage.setItem('isGetSite', true);

        vm.site = res.data.data[0];
        if(!vm.site){
          return
        }

        localStorage.setItem('site', JSON.stringify(vm.site));

        vm.getStore();
        vm.getCategories();
        vm.getProducts('', true);
      })
      .catch((err) => { 
        console.error(err);
        vm.login(vm.getSite);
      });
    },

    getStore(){
      const vm = this;

      const url = `${vm.protocol}//${vm.api}/interface/store/getStore`;
      let o = `Preview=${this.site.Preview}`;
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
      this.$http.post(url, o, config).then((res) => {
        if(res.data.errormessage){
          vm.login(vm.getStore);
          return;
        }
        vm.store = res.data.data[0];
        vm.arrangement = vm.store.Sort || "0";
        document.title = vm.store.Name;
      })
      .catch((err) => { 
        console.error(err);
        vm.login(vm.getStore);
      });
    },
    getCategories() {
      const vm = this;

      let o = `Preview=${this.site.Preview}`;
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      const url = `${vm.protocol}//${vm.api}/interface/store/GetCategory`;
      this.$http.post(url, o, config).then((res) => {
        vm.categories =[{ID: "0", Name: "所有分類商品", Show: "1"}, ...res.data.data];
      })
      .catch((err) => { console.error(err) });
    },
    getProducts(type, isOpen) {
      const vm = this;

      let o = `Preview=${this.site.Preview}`;
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      const url = `${vm.protocol}//${vm.api}/interface/store/storeLogin`;
      this.$http.post(url, o, config).then( res => {
        if(res.data.errormessage){
          vm.login(vm.getProducts, [type]);
          return;
        }

        vm.products = res.data.data;
        let data2 =  res.data.data2;
        for(let i = 0; i < vm.products.length; i++){
          let p = vm.products[i];
          let f = false;
          for(let k = 0; k < data2.length; k++){
            if(data2[k].ProductID == p.ID){
              f = true;

              if(!p.selectSpecIndex){
                vm.$set(p, 'selectSpecIndex', '-1');
                vm.$set(p, 'selectSpecItem', {});
                vm.$set(p, 'specArr', []);
              }

              vm.$set(data2[k], 'buyQty', 0);
              p.specArr.push(data2[k]);
            }
          }
          if( !f ){
            p.buyQty = 0;
          }
          vm.$set(p, 'mainImgIndex', 0);
          vm.$set(p, 'imgArr', [p.Img1, p.Img2, p.Img3, p.Img4, p.Img5]);
          vm.$set(p, 'categoryArr', [p.Category1, p.Category2, p.Category3, p.Category4, p.Category5]);
          let c = 0;
          for(let j = 0; j < p.imgArr.length; j++){
            if(p.imgArr[j]){
              c++
            }
          }
          vm.$set(p, 'allPicLength', c);
          vm.$set(p, 'isShowOption', 0);
        }

        vm.category = '0';
        vm.getCarts(type, '1');

        // 
        if(isOpen){
          let id = location.href.split('?id=')[1] || -1;
          if(id > -1){
            for(let i = 0; i < vm.products.length; i++){
              if(vm.products[i].ID == id){
                vm.showSelect( vm.products[i], i);
              }
            }
          }
          window.history.replaceState({}, document.title, "/cart/");
        }

        vm.$nextTick(() => {
          vm.productCompleted = true;
        })
      })
      .catch((err) => {
        console.error(err);
        vm.login(vm.getProducts, [type]);
      });
    },
    
    getAddPrice(id, item, type2){
      const vm = this;

      const url = `${vm.protocol}//${vm.api}/interface/store/GetAdditional`;
      const params = `id=${id}&Preview=${this.site.Preview}`;
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
      vm.$http.post(url, params, config).then((res) => {
        if(res.data.errormessage){
          vm.login(vm.getAddPrice, [id, item, type2]);
          return;
        }

        let data = res.data.data;
        let data2 = res.data.data2;
        for( let i = 0; i < data.length; i++){
          let p = data[i]; 
          for(let k = 0; k < data2.length; k++){
            if(data2[k].ProductID == p.ID){
              if(!p.selectSpecIndex){
                vm.$set(p, 'selectSpecIndex', '-1');
                vm.$set(p, 'selectSpecItem', {});
                vm.$set(p, 'isShowOption', 0);
                vm.$set(p, 'specArr', []);
              }
              vm.$set(data2[k], 'buyQty', 0);
              p.specArr.push(data2[k]);
            }
          }
          if( !p.specArr ){
            p.Qty = 0;
          }
        }

        vm.$set(item, 'addPrice', data);
        if(type2){
          vm.getCarts('' , type2);
        } 
        else {
          vm.getCarts();
        }
      })
      .catch((err) => {
        console.error(err);
        vm.login(vm.getAddPrice, [id, item, type2]);
      });
    },
    
    getCarts(type, type2){ // type '0' '1'getTotal type2 '0' '1'
      this.carts = localStorage.getItem(`${this.site.Site}@carts`);
      this.carts = this.carts ? JSON.parse(this.carts) : [];

      let isGetTotal = 0;
      this.computedCartsLength();
      if(type2 && type2 == '1'){
        this.cartsSLength = this.cartsLength;
      }
      for(let i = this.carts.length-1; i > -1; i--){
        let j;
        for(j = 0; j < this.products.length; j++){
          if(this.products[j].ID == this.carts[i].ID){
            let productMaxQty;

            if(this.products[j].specArr && this.carts[i].specArr){
              for(let k = this.carts[i].specArr.length-1; k > -1; k--){
                let l;
                for(l = 0; l < this.products[j].specArr.length; l++){
                  if(this.carts[i].specArr[k].ID == this.products[j].specArr[l].ID){
                    this.products[j].specArr[l].buyQty = this.carts[i].specArr[k].buyQty
                    if(this.products[j].specArr[l].Enable == 1 && this.products[j].specArr[l].buyQty > this.products[j].specArr[l].Amount){
                      this.products[j].specArr[l].buyQty = this.products[j].specArr[l].Amount;
                    }
                    break;
                  }
                } 
                if( l == this.products[j].specArr.length){
                  this.carts[i].specArr.splice(k, 1);
                }
              }
              if(this.itemTotalQty(this.products[j]) == 0){
                this.carts.splice(i, 1);
                break;
              }
              else {
                productMaxQty = this.itemTotalQty(this.products[j]);
              }
            }
            else if(!this.products[j].specArr && !this.carts[i].specArr){
              this.products[j].buyQty = this.carts[i].buyQty;
              if(this.products[j].Enable == 1 && this.products[j].buyQty > this.products[j].Amount){
                this.products[j].buyQty = this.products[j].Amount;
              }

              if(this.products[j].buyQty == 0){
                this.carts.splice(i, 1);
                break;
              }
              else {
                productMaxQty = this.products[j].buyQty;
              }
            }
            else{
              this.carts.splice(i, 1);
              break;
            }

            if(this.carts[i].addPrice && !this.products[j].addPrice){
              isGetTotal = 1;
              this.getAddPrice(this.products[j].ID, this.products[j], '0');
            }
            if(this.carts[i].addPrice && this.products[j].addPrice){
              for(let k = this.carts[i].addPrice.length - 1; k > -1 ; k--){
                let l;
                for(l = 0; l < this.products[j].addPrice.length; l++){
                  if(this.carts[i].addPrice[k].ID == this.products[j].addPrice[l].ID){
 
                    if(this.carts[i].addPrice[k].specArr && this.products[j].addPrice[l].specArr){
                      for(let m = this.carts[i].addPrice[k].specArr.length-1; m > -1; m--){
                        let n;
                        for(n = 0; n < this.products[j].addPrice[l].specArr.length; n++){
                          if(this.carts[i].addPrice[k].specArr[m].ID == this.products[j].addPrice[l].specArr[n].ID){
                            this.products[j].addPrice[l].specArr[n].buyQty = this.carts[i].addPrice[k].specArr[m].buyQty

                            if ( this.products[j].addPrice[l].specArr[n].Enable == 1 ) {
                              let othersQty = this.getAddPriceAllQty(this.products[j].ID, this.products[j].addPrice[l], this.products[j].addPrice[l].specArr[n]);
                              if( this.products[j].addPrice[l].specArr[n].buyQty + othersQty > this.products[j].addPrice[l].specArr[n].Amount ){
                                if(othersQty == 0){
                                  this.products[j].addPrice[l].specArr[n].buyQty = this.products[j].addPrice[l].specArr[n].Amount;
                                }
                                else {
                                  let leftQty = this.products[j].addPrice[l].specArr[n].Amount - othersQty;
                                  if( leftQty <= 0 ){
                                    this.products[j].addPrice[l].specArr[n].buyQty = 0;
                                  }
                                  else{
                                    this.products[j].addPrice[l].specArr[n].buyQty = leftQty;
                                  }
                                }
                              }
                            }

                            if(this.products[j].addPrice[l].specArr[n].buyQty > productMaxQty){
                              this.products[j].addPrice[l].specArr[n].buyQty = productMaxQty;
                            }
                            break;
                          }
                        } 
                        if(n == this.products[j].addPrice[l].specArr.length){
                          this.carts[i].addPrice[k].specArr.splice( m, 1);
                        }
                      }
                    }
                    else if(!this.carts[i].addPrice[k].specArr && !this.products[j].addPrice[l].specArr){
                      this.products[j].addPrice[l].Qty = this.carts[i].addPrice[k].Qty;
                        
                      if ( this.products[j].addPrice[l].Enable == 1 ) {
                        let othersQty = this.getAddPriceAllQty(this.products[j].ID, this.products[j].addPrice[l]);
                        if( this.products[j].addPrice[l].Qty + othersQty > this.products[j].addPrice[l].Amount ){
                          if(othersQty == 0){
                            this.products[j].addPrice[l].Qty = this.products[j].addPrice[l].Amount;
                          }
                          else {
                            let leftQty = this.products[j].addPrice[l].Amount - othersQty;
                            if( leftQty <= 0 ){
                              this.products[j].addPrice[l].Qty = 0;
                            }
                            else{
                              this.products[j].addPrice[l].Qty = leftQty;
                            }
                          }
                        }
                      }

                      if(this.products[j].addPrice[l].Qty > productMaxQty){
                        this.products[j].addPrice[l].Qty = productMaxQty;
                      }
                    }

                    break;
                  }
                } 
                if(l == this.products[j].addPrice.length){
                  this.carts[i].addPrice.splice(k, 1);
                }
              }
            }

            break;
          }
        }
        if(j == this.products.length || this.itemTotalQty(this.products[j]) == 0 ){
          this.carts.splice(i, 1);
        }
        else {
          if(isGetTotal == 0){
            this.$set( this.carts, i, JSON.parse(JSON.stringify(this.products[j])))
          }
        }
      }
      this.setCarts();
      if(isGetTotal == 0) {
        if(type && type == '1'){
          this.getTotal(1);   
        }
        else {
          this.getTotal(0);
        }

        this.computedCartsLength();
        if(this.cartsSLength != this.cartsLength){
          this.showMessage('部分商品下架，請重新確認', false);
        }
      }
    },
    setCarts(){
      localStorage.setItem(`${this.site.Site}@carts`, JSON.stringify(this.carts));
      this.computedCartsLength();
    },

    discount(){
      const vm = this;
      if(!vm.discountCode){
        vm.discountMessage = '請輸入折扣碼';
        vm.isDiscountMessage = true;
        return;
      }
      const url = `${vm.protocol}//${vm.api}/interface/store/CheckDiscountCode`;
      const params = `code=${vm.discountCode}&Preview=${this.site.Preview}`;
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
      vm.$http.post(url, params, config).then((res) => {
        if(res.data.errormessage){
          vm.login(vm.discount);
          return;
        }
        let data = res.data.data[0].status;
        let message = '';
        if(data == 1){
          vm.showMessage('套用折扣碼成功', true);
          vm.isDiscountMessage = false;
        } else if (data == 0){
          message = '查無此折扣碼';
        } else if (data == 2){
          message = '折扣碼已用完';
        }

        if (data == 1) {
          vm.useCodeSuccess = vm.discountCode;
          vm.getTotal(0);
        } 
        else {
          vm.discountMessage = message;
          vm.isDiscountMessage = true;

          vm.discountCode = '';
          vm.useCodeSuccess = '';
          vm.getTotal(0);
        }
      }).catch((err) => { 
        console.error(err);
        this.showMessage('套用折扣碼異常，請稍後再試', false);
        vm.login();
      });
    },
    
    createCartsStr(){
      let o = {
        'id': '',
        'price': '',
        'qry': '',
        'additionalid':'',
        'additionalprice':'',
        'additionalqry':'',
        'specificationid':'',
        'specificationqty':'',
        'ItemName': '',
      };
      this.carts.forEach(function(c,i){
        if(c.buyQty){
          o.id += ( o.id ==='' ? `${c.ID}`  : `,${c.ID}` );
          o.price += ( o.price ==='' ? `${c.NowPrice}`  : `,${c.NowPrice}` );
          o.qry += ( o.qry ==='' ? `${c.buyQty}`  : `,${c.buyQty}` );
          o.ItemName +=  o.ItemName ? '#' : '';
          o.ItemName += `${c.Name} ${c.NowPrice} 元 x ${c.buyQty}`;
        }
        else{
          for(let j = 0; j < c.specArr.length; j ++){
            if( c.specArr[j].buyQty != 0){
              o.specificationid += ( o.specificationid ==='' ? `${c.specArr[j].ID}`  : `,${c.specArr[j].ID}` );
              // o.specificationprice += ( o.specificationprice ==='' ? `${c.NowPrice}`  : `,${c.NowPrice}` );
              o.specificationqty += ( o.specificationqty ==='' ? `${c.specArr[j].buyQty}`  : `,${c.specArr[j].buyQty}` );

              o.ItemName +=  o.ItemName ? '#' : '';
              o.ItemName += `${c.Name} ${c.specArr[j].Name} NT$${c.NowPrice} x ${c.specArr[j].buyQty}`;
            }
          }
        }
        
        if(c.addPrice){
          for( let j = 0; j < c.addPrice.length; j++){
            let item = c.addPrice[j];
            if(item.Qty || item.Qty == 0){
              if(item.Qty != 0){
                o.additionalid += ( o.additionalid === "" ? `${item.ID}`  : `,${item.ID}` );
                o.additionalprice += ( o.additionalprice === "" ? `${item.Price}`  : `,${item.Price}` );
                o.additionalqry += ( o.additionalqry === "" ? `${item.Qty}`  : `,${item.Qty}` );
                
                o.ItemName +=  o.ItemName ? '#' : '';
                o.ItemName += `${item.Name} ${item.NowPrice} 元 x ${item.buyQty}`;
              }
            }
            else {
              for(let k = 0; k < item.specArr.length; k++){
                if(  item.specArr[k].buyQty ){
                  o.specificationid += ( o.specificationid ==='' ? `${item.specArr[k].ID}`  : `,${item.specArr[k].ID}` );
                  // o.specificationprice += ( o.specificationprice ==='' ? `${c.NowPrice}`  : `,${c.NowPrice}` );
                  o.specificationqty += ( o.specificationqty ==='' ? `${item.specArr[k].buyQty}`  : `,${item.specArr[k].buyQty}` );
                
                  o.ItemName +=  o.ItemName ? '#' : '';
                  o.ItemName += `${item.Name} ${item.specArr[k].Name} NT$${item.NowPrice} x ${item.specArr[k].buyQty}`;
                }
              }
            }
          }
        }
      })
      return o;
    },
    getTotal(type){
      const vm = this;
      let o = vm.createCartsStr();
      if( !o.id && !o.specificationid ){
        return;
      }
      this.site = JSON.parse(localStorage.getItem('site')) || [] ;
      const url = `${vm.protocol}//${vm.api}/interface/store/GetProductTotal?`;
      const params = `id=${o.id}&qry=${o.qry}&additionalid=${o.additionalid}&additionalqry=${o.additionalqry}&specificationid=${o.specificationid}&specificationqty=${o.specificationqty}&code=${vm.useCodeSuccess}&shipping=${vm.transport == 0 ? 0 : vm.transport * 1 + 1}&type=${type}&Preview=${this.site.Preview}`;
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
      this.$http.post(url, params, config).then((res) => {

        if(res.data.errormessage){
          // this.stepIndex = 1;
          // vm.getProducts();
          console.log('getTotal errormessage')
          return;
        }

        vm.total = res.data.data[0];

      }).catch((err) => {
        console.error(err)
        // this.stepIndex = 1;
        // vm.getProducts();
      });
    },

    // checkOrder confirm 
    cancelDiscountCodeCreateOrder(){
      let vm = this;
      vm.discountCode = '';
      vm.useCodeSuccess = '';
      vm.total.Sum = vm.total.Total*1 + vm.total.Shipping*1 - vm.total.Discount*1;
      vm.total.DiscountCode = 0;
      vm.isConfirm2 = false;
      vm.createOrder();
    },
    checkOrder(){
      const vm = this;
      if(vm.orderIng){
        return;
      } else {
        vm.$validator.validate().then((result) => {
          if (result && vm.transport !== '0' && (vm.store.Receipt === '0' || (vm.store.Receipt === '1' && (vm.invoice_type==='1' || (vm.invoice_type==='2' && (vm.invoice_title!=='' && vm.invoice_uniNumber!=='' )))))){
            if ( vm.site.Preview == 2 ){
              vm.showMessage( '預覽模式不開放完成訂單', false);
              return;
            }
            vm.createOrder();
          }
        });
      }
    },

    // createOrder confirm
    clearCarts(){
      this.carts = [];
      this.setCarts();

      this.info = {
        purchaser_email:'',
        purchaser_name:'',
        purchaser_number:'',
        receiver_name:'',
        receiver_number:'',
        receiver_address:'',
        info_message:''
      };

      this.invoice_type = '0';
      this.invoice_title = '';
      this.invoice_uniNumber = '';

      this.discountCode = '';
      this.useCodeSuccess = '';

      this.showPage = 'main';
      this.stepIndex= 1;

      this.productCompleted = false;

      this.getCategories();
      this.getProducts();
      this.category = '0';
      this.currentPage = 1;
    }, 
    toPay(){
      this.clearCarts(); 
      this.isConfirm = false;

      window.open(this.payResult.payUrl);

    },
    createOrder(){
      this.orderIng = true;
      let o = this.createCartsStr();

      let url = this.api === '192.168.80.239:5052' ? `${this.protocol}//${this.api}/Line/LinePayRequest` : `${this.protocol}//${this.api}/LineMK/Line/LinePayRequest`;
      // let url = `${this.protocol}//${this.api}/LineMK/Line/LinePayRequest`;
      
      let formData = new FormData();
      if(true){
        formData.append('Site' , this.site.Site);
        formData.append('StoreName' , this.site.Name);
        formData.append('productName' , this.store.Name);
        formData.append('ProductIdList' , o.id);
        formData.append('PriceList' , o.price);
        formData.append('AmountList' , o.qry);
        formData.append('ExtraProductIdList' , o.additionalid);
        formData.append('ExtraPriceList' , o.additionalprice);
        formData.append('ExtraAmountList' , o.additionalqry);
        formData.append('ItemName' , o.ItemName);

        formData.append('SizeIdList' , o.specificationid);
        // formData.append('SpecPriceList' , o.specificationprice);
        formData.append('SizeAmountList' , o.specificationqty);

        formData.append('SendWay' , this.transport * 1);
        formData.append('PayType' , this.pay_type * 1);

        formData.append('Email' , this.info.purchaser_email);
        formData.append('Name' , this.info.purchaser_name);
        formData.append('Phone' , this.info.purchaser_number);
        formData.append('Receiver' , this.info.receiver_name);
        formData.append('ReceiverPhone' , this.info.receiver_number);
        formData.append('Address' , this.info.receiver_address);
        formData.append('Message' , this.info.info_message);
        formData.append('Discount' , this.total.Discount * 1);
        formData.append('Shipping' , this.total.Shipping * 1);
        formData.append('Total' , this.total.Sum * 1);
        formData.append('DiscountPrice' , this.total.DiscountCode*1);
        formData.append('DiscountCode' , this.useCodeSuccess);
        formData.append('LogoUrl' , this.store.PayLogo);
        formData.append('Type' , this.invoice_type * 1);
        formData.append('Title' , this.invoice_title);
        formData.append('UniNumber' , this.invoice_uniNumber);

        formData.append('Preview' , this.site.Preview);
      }
      const config = {
        headers: {
          // 'Content-Type': 'application/x-www-form-urlencoded'
          'Content-Type': 'multipart/form-data'
        }
      };
      const vm = this;
      this.$http.post(url, formData, config)
      .then((res) => {
        if(!res.data.success){
          if( res.data.message === '該mail已使用過折扣碼' ){
            vm.orderIng = false;
            vm.isConfirm2 = true;
            return;
          }

          if(res.data.message === '商品數量不足' || res.data.message === '加價商品數量不足'){
            vm.clearCarts();
          }

          vm.orderIng = false;
          vm.showMessage(res.data.message, false)
          return;
        }
        else {
          vm.orderIng = false;

          vm.payResult = res.data;
          vm.isConfirm = true;
        }
      })
      .catch((err) => {
        console.error(err);
        vm.login();
        vm.showMessage('完成訂單異常，請聯繫客服', false)
        vm.orderIng = false;
      });
    },

    getAmount(type, id, func, arr, pid){
      const vm = this;
      const url = `${vm.protocol}//${vm.api}/interface/store/GetProductQty`;
      
      let formData = new FormData();
      formData.append('id' , id);
      formData.append('type' , type);
      if(pid){
        formData.append('pid' , pid);
      }
      // formData.append('Preview' , this.site.Preview);

      const config = {
        headers: {
          // 'Content-Type': 'application/x-www-form-urlencoded'
          'Content-Type': 'multipart/form-data'
        }
      };
      vm.$http.post(url, formData, config).then((res) => {
        if(res.data.errormessage){
          // vm.login(vm.getAmount, [type, id, func, arr]);
        }
        else{
          let data = res.data.data[0];

          if(func){
            if(arr){
              arr.push(data);
              func(...arr);
            }
            else {
              func();
            }
          }
        }
      })
      .catch((err) => {
        console.error(err);
        // vm.login(vm.getAmount, [type, id, func, arr]);
      });
    },

    updateBuyQtyValidate(item, qty, data, itemStr, addPriceAllQty){
      let vm = this;

      let regExp = /^[0-9]+$/;

      if(!regExp.test(qty)){
        return 1;
      }

      if(qty*1 > 999){
        return 0;
      }

      // 下架
      if(!data){
        vm.getProducts();
        vm.showMessage(`${itemStr}已下架`, false);
        return 0;
      }
      item.Enable = data.Enable;
      item.Amount = data.Amount;

      // 數量不足
      if ( item.Enable == 1 ) {
        addPriceAllQty = addPriceAllQty ? addPriceAllQty : 0;
        if( qty*1 + addPriceAllQty*1 > item.Amount*1 ){
          vm.showMessage(`目前商品數量僅剩 ${item.Amount < 0 ? 0 : item.Amount} 組`, false);
          return 2;
        }
      }

      return 10;
    },
    getAddPriceAllQty(id, item, spec){
      let qty = 0;
      for(let i = 0; i < this.carts.length; i++){
        if(this.carts[i].addPrice && this.carts[i].ID != id){
          for(let j = 0; j < this.carts[i].addPrice.length; j++){
            if(this.carts[i].addPrice[j].ID == item.ID){
              if(spec){
                for(let k = 0; k < this.carts[i].addPrice[j].specArr.length; k++){
                  if(this.carts[i].addPrice[j].specArr[k].ID === spec.ID){
                    qty += this.carts[i].addPrice[j].specArr[k].buyQty*1;
                  }
                }
              }
              else{
                qty += this.carts[i].addPrice[j].Qty*1;
              }
            }
          }
        }
      }
      return qty;
    },
    itemTotalQty(item){
      let totalQty= 0;
      if(item.specArr){
        for(let i = 0; i < item.specArr.length; i++){
          // if(item.specArr[i].buyQty > maxQty){
          //   maxQty = item.specArr[i].buyQty;
          // }
          totalQty += item.specArr[i].buyQty*1;
        }
      }
      else {
        totalQty = item.buyQty;
      }
      return totalQty;
    },

    // 沒有規格
    // carts.buyQty change => update products => set carts
    updateCartsBuyQty(i, qty, data){
      let vm = this;

      let validate = vm.updateBuyQtyValidate(vm.carts[i], qty, data, '商品');
      if(!validate){
        return;
      }
      else if( validate == 1 ){
        qty = 0;
      } 
      else if ( vm.carts[i].Enable == 1 ) {
        if( qty*1 > vm.carts[i].Amount*1 ){
          qty = vm.carts[i].Amount*1;
        }
      }

      qty = qty * 1;

      //
      let item = vm.carts[i];
      item.buyQty = qty;

      if(item.buyQty === 0){
        vm.carts.splice(i, 1);
      }
      vm.setCarts();
      
      // 
      vm.products.forEach(product => {
        if(product.ID === item.ID){
          product.buyQty = qty;
        }
      })

      //
      if(item.addPrice){
        for(let j = 0; j < item.addPrice.length; j++){
          if(item.addPrice[j].specArr){
            for( let k = 0; k < item.addPrice[j].specArr.length; k++){
              if(item.addPrice[j].specArr[k].buyQty > item.buyQty){
                vm.getAmount( 3,  item.addPrice[j].specArr[k].ID, vm.updateCartsAddpriceQty_spec, [item, j, item.buyQty, k], item.ID);
              }
            }
          } 
          else {
            if(item.addPrice[j].Qty > item.buyQty){
              vm.getAmount( 2,  item.addPrice[j].ID, vm.updateCartsAddpriceQty, [item, j, item.buyQty], item.ID);
            }
          }
        }
      }

      vm.getTotal(0);
    },
    // pageFilterProduct.buyQty change => update carts => set carts
    updateProductsBuyQty(i, qty, e, data){
      let vm = this;
      let isfly = true;

      let validate = vm.updateBuyQtyValidate(vm.pageFilterProduct[i], qty, data, '商品');
      if(!validate){
        return;
      }
      else if( validate == 1 ){
        qty = 0;
      } 
      else if ( vm.pageFilterProduct[i].Enable == 1 ) {
        if( qty*1 > vm.pageFilterProduct[i].Amount*1 ){
          qty = vm.pageFilterProduct[i].Amount*1;
        }
      }

      qty = qty * 1;

      let isAdd = qty - vm.pageFilterProduct[i].buyQty;
      isfly = isAdd ? true : false;
      // update pageFilterProduct ( bind view )
      vm.$set(vm.pageFilterProduct[i], 'buyQty', qty);

      let changing = vm.pageFilterProduct[i];

      // update carts
      let k = -1;
      vm.carts.forEach((item, index)=>{
        if(item.ID === changing.ID){
          k = index;
          item.buyQty = changing.buyQty;
        }
      })
      if(k == -1){
        k = vm.carts.length;
        vm.carts.push(JSON.parse(JSON.stringify(changing)));
      } 

      if(vm.carts[k].buyQty == 0){
        vm.carts.splice(k, 1);
      }

      // set carts
      vm.setCarts();

      // fly
      if(e && isfly){
        vm.flyHandler(i,isAdd, e);
      }

      if(changing.addPrice){
        for(let j = 0; j < changing.addPrice.length; j++){

          if(changing.addPrice[j].specArr){
            for( let k = 0; k < changing.addPrice[j].specArr.length; k++){
              if(changing.addPrice[j].specArr[k].buyQty > changing.buyQty){
                vm.getAmount( 3,  changing.addPrice[j].specArr[k].ID, vm.updateProductsAddpriceQty_spec, [changing, j, changing.buyQty, k], changing.ID);
              }
            }
          } 
          else {
            if(changing.addPrice[j].Qty > changing.buyQty){
              vm.getAmount( 2,  changing.addPrice[j].ID, vm.updateProductsAddpriceQty, [changing, j, changing.buyQty], changing.ID);
            }
          }
        }
      }

      vm.getTotal(0);
    },

    // Addprice : carts.buyQty change => update products => set carts 
    // item: 商品, i: 加價購索引 
    updateCartsAddpriceQty(item, i, qty, data){
      let vm = this;

      let validate = vm.updateBuyQtyValidate(item.addPrice[i], qty, data, '商品', vm.getAddPriceAllQty(item.ID, item.addPrice[i]));
      if(!validate){
        return;
      }
      else if( validate == 1 ){
        qty = 0;
      }
      else if ( item.addPrice[i].Enable == 1 ) {
        let othersQty = vm.getAddPriceAllQty(item.ID, item.addPrice[i]);
        if( qty*1 + othersQty > item.addPrice[i].Amount*1 ){
          if(othersQty == 0){
            qty = item.addPrice[i].Amount*1;
          }
          else {
            let leftQty = item.addPrice[i].Amount*1 - othersQty;
            if( leftQty <= 0 ){
              qty = 0;
            }
            else{
              qty = leftQty;
            }
          }
        }
      }

      let maxQty = vm.itemTotalQty(item)
      if( qty > maxQty ){
        qty = maxQty
      }

      qty = qty * 1;

      item.addPrice[i].Qty = qty;

      vm.setCarts();

      vm.products.forEach((product, index)=>{
        if(product.ID === item.ID){
          if(!product.addPrice){
            vm.getAddPrice(product.ID, product, '1');
          } 
          else {
            for(let j = 0; j < product.addPrice.length; j++){
              if(product.addPrice[j].ID == item.addPrice[i].ID){
                product.addPrice[j].Qty = qty;
              }
            }
          }
        }
      })

      vm.getTotal(0);
    },
    // Addprice : pageFilterProduct.buyQty change => update carts => set carts
    updateProductsAddpriceQty(item, i, qty, data){
      let vm = this;

      let validate = vm.updateBuyQtyValidate(item.addPrice[i], qty, data, '商品', vm.getAddPriceAllQty(item.ID, item.addPrice[i]))
      if(!validate){
        return;
      }
      else if( validate == 1 ){
        qty = 0;
      }
      else if ( item.addPrice[i].Enable == 1 ) {
        let othersQty = vm.getAddPriceAllQty(item.ID, item.addPrice[i]);
        if( qty*1 + othersQty > item.addPrice[i].Amount*1 ){
          if(othersQty == 0){
            qty = item.addPrice[i].Amount*1;
          }
          else {
            let leftQty = item.addPrice[i].Amount*1 - othersQty;
            if( leftQty <= 0 ){
              qty = 0;
            }
            else{
              qty = leftQty;
            }
          }
        }
      }

      let maxQty = vm.itemTotalQty(item)
      if( qty > maxQty ){
        qty = maxQty;
      }

      qty = qty * 1;

      // update pageFilterProduct ( bind view )
      vm.$set(item.addPrice[i], 'Qty', qty);

      // update carts
      let changing = item;
      vm.carts.forEach((item, index)=>{
        if(item.ID === changing.ID){
          if(!item.addPrice){
            item.addPrice =  [...changing.addPrice];
          }
          for(let j = 0; j < item.addPrice.length; j++){
            if( item.addPrice[j].ID == changing.addPrice[i].ID){
              item.addPrice[j].Qty = changing.addPrice[i].Qty;
            }
          }
        }
      })

      // set carts
      vm.setCarts();

      vm.getTotal(0);
    },


    // 有規格
    // carts.buyQty change => update products => set carts
    // select_spec_id selectSpecItem specArr (buyQty)
    updateCartsBuyQty_spec(i, qty, i2, data){
      let vm = this;

      let validate = vm.updateBuyQtyValidate( vm.carts[i].specArr[i2], qty, data, '此規格') 
      if(!validate){
        return;
      }
      else if( validate == 1 ){
        qty = 0;
      } 
      else if ( vm.carts[i].specArr[i2].Enable == 1 ) {
        if( qty*1 > vm.carts[i].specArr[i2].Amount*1 ){
          qty = vm.carts[i].specArr[i2].Amount*1;
        }
      }

      qty = qty * 1;

      vm.carts[i].specArr[i2].buyQty = qty;
      
      vm.products.forEach((product, index)=>{
        if(product.ID === vm.carts[i].ID){
          for(let j = 0 ; j < product.specArr.length; j++){
            if(product.specArr[j].ID === vm.carts[i].specArr[i2].ID){
              product.specArr[j].buyQty = qty;
            }
          }
        }
      })

      let maxQty =  vm.itemTotalQty(vm.carts[i]);

      if(vm.carts[i].addPrice){
        for(let j = 0; j < vm.carts[i].addPrice.length; j++){
          // 有規格加價購
          if( vm.carts[i].addPrice[j].specArr){
            for(let k = 0; k < vm.carts[i].addPrice[j].specArr.length; k++){
              if(vm.carts[i].addPrice[j].specArr[k].buyQty > maxQty){
                vm.getAmount( 3,  vm.carts[i].addPrice[j].specArr[k].ID, vm.updateCartsAddpriceQty_spec, [vm.carts[i], j, maxQty, k], vm.carts[i].ID);
              }
            }
          } 
          // 沒規格加價購
          else {
            if(vm.carts[i].addPrice[j].Qty > maxQty){
              vm.getAmount( 2,  vm.carts[i].addPrice[j].ID, vm.updateCartsAddpriceQty, [vm.carts[i], j, maxQty], vm.carts[i].ID);
            }
          }
        }
      }

      if(!maxQty){
        vm.carts.splice(i, 1);
      }
      vm.setCarts();

      vm.getTotal(0);
    },
    // pageFilterProduct.buyQty change => update carts => set carts
    updateProductsBuyQty_spec(i, qty, i2, e, data){
      let vm = this;
      let isfly = true;

      let validate = vm.updateBuyQtyValidate( vm.pageFilterProduct[i].specArr[i2], qty, data, '此規格')
      if(!validate){
        return;
      }
      else if( validate == 1 ){
        qty = 0;
      } 
      else if ( vm.pageFilterProduct[i].specArr[i2].Enable == 1 ) {
        if( qty*1 > vm.pageFilterProduct[i].specArr[i2].Amount*1 ){
          qty = vm.pageFilterProduct[i].specArr[i2].Amount*1;
        }
      }

      qty = qty * 1;

      let isAdd = qty - vm.pageFilterProduct[i].specArr[i2].buyQty;
      isfly = isAdd ? true : false;
      // update pageFilterProduct ( bind view )
      vm.$set(vm.pageFilterProduct[i].specArr[i2], 'buyQty', qty);

      // update carts
      let cartsIndex = -1;
      let changing = vm.pageFilterProduct[i].specArr[i2];
      vm.carts.forEach((item, index)=>{
        if(item.ID === vm.pageFilterProduct[i].ID){
          cartsIndex = index;
          for(let j = 0 ; j < item.specArr.length; j++){
            if(item.specArr[j].ID === changing.ID){
              item.specArr[j].buyQty = qty;
            }
          }
        }
      })
      if(cartsIndex == -1){
        cartsIndex = vm.carts.length;
        vm.carts.push(JSON.parse(JSON.stringify(vm.pageFilterProduct[i])));
      } 

      let maxQty =  vm.itemTotalQty(vm.pageFilterProduct[i]);
      if(!maxQty){
        vm.carts.splice(cartsIndex, 1);
      }

      // set carts
      vm.setCarts();

      // fly
      if(e && isfly){
        vm.flyHandler(i,isAdd, e);
      }

      if(changing.addPrice){
        for(let j = 0; j < changing.addPrice.length; j++){
          // 有規格加價購
          if( changing.addPrice[j].specArr ){
            for(let k = 0; k < changing.addPrice[j].specArr.length; k++){
              if(changing.addPrice[j].specArr[k].buyQty > maxQty){
                vm.getAmount( 3,  changing.addPrice[j].specArr[k].ID, vm.updateProductsAddpriceQty_spec, [changing, j, maxQty, k], changing.ID);
              }
            }
          } 
          // 沒有規格加價購
          else{
            if(changing.addPrice[j].Qty > maxQty){
              vm.getAmount( 2,  changing.addPrice[j].ID, vm.updateProductsAddpriceQty, [changing, j, maxQty], changing.ID);
            }
          }
        }
      }

      vm.getTotal(0);
    },

    // item: 商品, i: 加價購索引 
    updateCartsAddpriceQty_spec(item, i, qty, i2, data){
      let vm = this;

      let validate = vm.updateBuyQtyValidate( item.addPrice[i].specArr[i2], qty, data, '此規格', vm.getAddPriceAllQty(item.ID, item.addPrice[i],item.addPrice[i].specArr[i2]));
      if(!validate){
        return;
      }
      else if( validate == 1 ){
        qty = 0;
      } 
      else if ( item.addPrice[i].specArr[i2].Enable == 1 ) {
        let othersQty = vm.getAddPriceAllQty(item.ID, item.addPrice[i],item.addPrice[i].specArr[i2]);
        if( qty*1 + othersQty > item.addPrice[i].specArr[i2].Amount*1 ){
          if(othersQty == 0){
            qty = item.addPrice[i].specArr[i2].Amount*1;
          }
          else {
            let leftQty = item.addPrice[i].specArr[i2].Amount - othersQty;
            if( leftQty < 0 ){
              qty = 0;
            }
            else{
              qty = leftQty;
            }
          }
        }
      }

      // 主商品有規格數量判斷，主商品無規格數量判斷
      let maxQty = vm.itemTotalQty(item);
      if( qty > maxQty ){
        qty = maxQty;
      }

      qty = qty * 1;

      item.addPrice[i].specArr[i2].buyQty = qty;

      vm.setCarts();

      vm.products.forEach(product => {
        if(product.ID === item.ID){
          if(!product.addPrice){
            vm.getAddPrice(product.ID, product, '1');
          } 
          else {
            for( let j = 0; j < product.addPrice.length; j++ ){
              if(product.addPrice[j].ID == item.addPrice[i].ID){
                for( let k = 0; k < product.addPrice[j].specArr.length; k++){
                   if(product.addPrice[j].specArr[k].ID == item.addPrice[i].specArr[i2].ID){
                     product.addPrice[j].specArr[k].buyQty = qty;
                   }
                }
              }
            }
          }
        }
      })

      vm.getTotal(0);
    },
    // Addprice : pageFilterProduct.buyQty change => update carts => set carts
    updateProductsAddpriceQty_spec(item, i, qty, i2, data){
      let vm = this;

      let validate = vm.updateBuyQtyValidate( item.addPrice[i].specArr[i2], qty, data, '此規格', vm.getAddPriceAllQty(item.ID, item.addPrice[i], item.addPrice[i].specArr[i2]));
      if(!validate){
        return;
      }
      else if( validate == 1 ){
        qty = 0;
      } 
      else if ( item.addPrice[i].specArr[i2].Enable == 1 ) {
        let othersQty = vm.getAddPriceAllQty(item.ID, item.addPrice[i], item.addPrice[i].specArr[i2]);
        if( qty*1 + othersQty > item.addPrice[i].specArr[i2].Amount*1 ){
          if(othersQty == 0){
            qty = item.addPrice[i].specArr[i2].Amount*1;
          }
          else {
            let leftQty = item.addPrice[i].specArr[i2].Amount*1 - othersQty;
            if( leftQty <= 0 ){
              qty = 0;
            }
            else{
              qty = leftQty;
            }
          }
        }
      }

      let maxQty = vm.itemTotalQty(item)
      if( qty > maxQty ){
        qty = maxQty;
      }

      qty = qty * 1;

      // update pageFilterProduct ( bind view )
      vm.$set(item.addPrice[i].specArr[i2], 'buyQty', qty);

      // update carts
      let changing = item;
      vm.carts.forEach((item, index)=>{
        if(item.ID === changing.ID){
          vm.carts[index].addPrice =  [...changing.addPrice];
        }
      })

      // set carts
      vm.setCarts();

      vm.getTotal(0);
    },

    flyHandler(i,isAdd,{pageX, pageY}){
      // 設定 flyImg 起點 終點 
      let start;
      let end;

      // cartIcon 
      var scrollHeight = window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop || 0;
      let cartIcon = document.querySelector('.cartIcon');
      let cartIconTop = cartIcon.offsetTop + scrollHeight + 12.5;
      let cartIconLeft = cartIcon.offsetLeft + 12.5;

      if(isAdd > 0){
        start = {x:pageX, y:pageY};
        end = {x:cartIconLeft, y:cartIconTop};
      } else {
        start = {x:cartIconLeft, y:cartIconTop};
        end = {x:pageX, y:pageY};
      }

      // 起點顯示 flyImg
      let flyImg = document.querySelector('.flyImg');
      this.flyImgIndex = i;
      this.flyImgTop = start.y;
      this.flyImgLeft = start.x;
      this.showflyImg = 1;

      // 設定 intervalTimes
      let intervalTimes = 50;
      let moveX = (end.x - start.x)/intervalTimes;
      let moveY = (end.y - start.y)/intervalTimes;

      // fly
      if(isAdd < 0){
        this.cartIconScaleHandler();
      }
      let vm = this;
      var interval = setInterval(function(){
        intervalTimes-=1;

        start.x += moveX;
        start.y += moveY;
        vm.flyImgTop = start.y;
        vm.flyImgLeft = start.x;

        if(intervalTimes < 1){
          clearInterval(interval);
          vm.showflyImg = 0;
          if(isAdd > 0){
            vm.cartIconScaleHandler();
          }
        }
      }, 10);
    },
    cartIconScaleHandler(){
      let vm = this;
      vm.cartIconScale = 1;
      setTimeout(function(){
        vm.cartIconScale = 0;
      },200);
    },

    // postProduct: 點擊商品，後端
    postProduct(id){
      const vm = this;
      localStorage.setItem('isActiveUser', 1);

      const url = `${vm.protocol}//${vm.api}/interface/store/PostProduct`;
      
      let formData = new FormData();
      formData.append('id' , id);

      const config = {
        headers: {
          // 'Content-Type': 'application/x-www-form-urlencoded'
          'Content-Type': 'multipart/form-data'
        }
      };
      vm.$http.post(url, formData, config).then((res) => {
        if(res.data.errormessage){
        }
        else{
        }
      })
      .catch((err) => {
        console.error(err);
        // vm.login(vm.getAmount, [type, id, func, arr]);
      });
    },

    // this.showPage = 'selectProduct'; 
    showSelect( item, index){
      this.selectProduct = item; 
      this.selectIndex = index; 
      this.showPage = 'selectProduct'; 
      this.getAddPrice(item.ID, item, '1'); 
      this.postProduct(item.ID); 
      this.allPicUlleft = 0;
    }, 

    // carts step
    stepOneToTwo(){
      if( false ){
        return;
      }
      this.getStore();
      this.getProducts('1');
      this.stepIndex = 2;
      this.$refs.cartScroll.scrollTop = 0;
    },
    // carts info
    pInput(){
      if(this.isSame){
        this.info.receiver_name = this.info.purchaser_name;
        this.info.receiver_number = this.info.purchaser_number;
      }
    },
    info_message_input(){
      if(this.info.info_message.length > 150){
        this.info.info_message = this.info.info_message.substring(0, 150);
      }
    },

    numberInput(item){
      let type = item.buyQty === undefined ? 'Qty' : 'buyQty';
      this.$set(item, type, item[type].replace(/[^\d]/g,''))
    },
    numberInput_2(event){
      event.srcElement.value = event.srcElement.value.replace(/[^\d]/g,'');
    },

    // select
    selectSpec(item, index){
      item.isShowOption = 0; 
      item.selectSpecIndex = index;
      item.selectSpecItem = item.specArr[index];
    },

    // this.cartsLength
    computedCartsLength(){
      let addPriceLength = 0;
      let productLength = 0;

      for(let i = 0; i < this.carts.length; i++){
        if(this.carts[i].buyQty){
          productLength += 1;
        } 
        else if(!this.carts[i].buyQty && this.carts[i].buyQty != 0){
          for(let k = 0; k < this.carts[i].specArr.length; k++){
            if(this.carts[i].specArr[k].buyQty != 0){
              productLength += 1;
            }
          }
        }
        // 加價購
        if(this.carts[i].addPrice){
          for(let j = 0; j < this.carts[i].addPrice.length; j++){
            // 沒有規格
            if(this.carts[i].addPrice[j].Qty ){
              addPriceLength += 1;
            } 
            else if(!this.carts[i].addPrice[j].Qty && this.carts[i].addPrice[j].Qty != 0){
              for(let k = 0; k < this.carts[i].addPrice[j].specArr.length; k++){
                if(this.carts[i].addPrice[j].specArr[k].buyQty != 0){
                  addPriceLength += 1;
                }
              }
            }
          }
        }
      }
      this.cartsLength = productLength + addPriceLength;
    },

    computedLiLength(){
      this.liWidth = (this.$refs.allPicWidth.offsetWidth) / 3;
      this.allPicHeight = this.liWidth;
      this.picWidth = this.liWidth - 10;
    },

    computedVideoWidth(v){
      let contentWidth;
      let items;
      if( v === 'Content' || v === 'Description' || v === 'PrivacyPolicy' ){
        contentWidth = this.$refs.notice_page_content.offsetWidth;
        items = document.querySelectorAll('.notice_page .content iframe');
      }
      else {
        contentWidth = this.$refs.selectProduct_detail_content.offsetWidth - 20;
        items = document.querySelectorAll('.selectProduct .detail .content iframe');
      }

      for(let i = 0; i < items.length ; i++){
        let itemWidth = items[i].width;

        if(itemWidth > contentWidth){
          let itemHeight = items[i].height;
          let newHeight = parseInt(itemHeight / ( itemWidth/contentWidth )) ;
          items[i].width = contentWidth;
          items[i].height = newHeight;
        }
      }
    },

    showMessage(messageStr, isSuccess){
      if(messageStr  == '部分商品下架，請重新確認'){
        if(!this.isShowMessage){
          return;
        }
      };
      if(messageStr  == '商品已下架' || messageStr  == '此規格已下架' || messageStr  == '部分商品下架，請重新確認'){
        this.isShowMessage = false;
      };
      for(let i = 0; i < this.messageArr.length; i++){
        if(this.messageArr[i].messageStr === messageStr){
          return;
        }
      }
      let id = new Date().getTime();
      this.messageArr.push({
        id,
        messageStr,
        isSuccess,
        messageActive: false,
        messagefadeout: false
      })
      setTimeout(()=>{
        this.messageArr.forEach((m, i)=>{
          if (m.id === id){
            this.messageArr[i].messageActive = true;
          }
        })
        setTimeout(()=>{
          this.messageArr.forEach((m, i)=>{
            if (m.id === id){
              this.messageArr[i].messagefadeout = true;
            }
          })
          setTimeout(()=>{
            this.messageArr.forEach((m, i)=>{
              if (m.id === id){
                this.messageArr.splice(i, 1);
                this.isShowMessage = true;
              }
            })
          }, 500)
        }, 5000)
      }, 100)
    },
    pageChange(p){
      p = p < 1 ? 1 : (p > this.totalPage ? this.totalPage : p);
      this.currentPage = p;
    },

    unescapeHTML(a){
      a = "" + a;
      return a.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
    },
    unescapeEnter(a){
      a = "" + a;
      return a.replace(/↵/g, '<br>');
    },

    urlPush(url) {
      window.location.href = url;
    },
  },
  created(){
    const vm = this;
    vm.api = location.host;
    vm.protocol = location.protocol;
  },
  mounted(){
    this.getSite();
    this.innerHeight = window.innerHeight;
    window.onresize = () => {
      this.innerHeight = window.innerHeight;
      if(this.showPage === 'selectProduct'){
        this.computedLiLength();
      }
    }
  }
}
</script>

<style lang="scss">
  @import "../assets/css/quill.css";
  @import "../assets/scss/index.scss";
</style>
