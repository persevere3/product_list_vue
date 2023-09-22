<template>
  <div v-show="productCompleted" class="productContainer" @click.stop="is_favorite_hover = false">

    <div class="notice_page" :style="`height:${innerHeight}px`" v-show="showPage === 'Content' || showPage === 'Description' || showPage === 'PrivacyPolicy'">
      <div class="background" >
        <div class="close" @click="selectProduct = {} ; showPage = 'main';"> <i class="fa fa-times" aria-hidden="true"></i> </div>
        <div class="content ql-editor" ref='notice_page_content' v-html="unescapeHTML(store[showPage])"></div>
      </div>
    </div>

    <div class="singleProduct" v-if="showPage === 'singleProduct'" :style="`height:${innerHeight}px`">
      <div class="background">
        <div class="picContent">
          <div class="pic">
            <div class="mainPic" :style="{backgroundImage :`url(${selectProduct.imgArr[selectProduct.mainImgIndex]})`}">
            </div>
            <div class="allPic">
              <div class="swiper-container">
                <div class="swiper-wrapper">
                  <div class="swiper-slide" v-for = "(item, index) in selectProduct.imgArr" :key="`${item}_${index}`"
                    :class="{active:selectProduct.mainImgIndex === index}"
                  >
                    <div class="border"></div>
                    <img :src="item" @click="selectProduct.mainImgIndex = index" alt="">
                  </div>
                </div>
              </div>
              <div class="controler" v-show="selectProduct.imgArr.length > 3">
                <div class="prev" @click="swiper.slidePrev()"> <i class="fa-solid fa-caret-left"></i> </div>
                <div class="next" @click="swiper.slideNext()"> <i class="fa-solid fa-caret-right"></i> </div>
              </div>
            </div>
          </div>
          <div class="content">
              <div class="title">{{selectProduct.Name}}</div>
              <!-- 多價格 singleProduct 主商品 info -->
              <template v-if="selectProduct.priceType === 'onePrice'">
                <div class="price" v-if="parseInt(selectProduct.Price) > -1" style="color:#9e9e9e; text-decoration: line-through; font-size:14px">NT$ {{ numberThousands(selectProduct.Price) }}</div>
                <div class="price">NT$ {{ numberThousands(selectProduct.NowPrice) }}</div>
              </template>
              <template v-else>
                <template v-if="selectProduct.selectSpecItem && selectProduct.selectSpecItem.ID">
                  <div class="price" v-if="parseInt(selectProduct.selectSpecItem.ItemPrice) > -1" style="color:#9e9e9e; text-decoration: line-through; font-size:14px">NT$ {{ numberThousands(selectProduct.selectSpecItem.ItemPrice) }}</div>
                  <div class="price">NT$ {{ numberThousands(selectProduct.selectSpecItem.ItemNowPrice) }}</div>
                </template>
                <template v-else>
                  <div class="price" v-if="selectProduct.priceRange" style="color:#9e9e9e; text-decoration: line-through; font-size:14px">NT$ {{ selectProduct.priceRange }}</div>
                  <div class="price">NT$ {{ selectProduct.nowPriceRange }}</div>
                </template>
              </template>
              
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
                  <div class="reduce" :class="{qtyDisabled:selectProduct.selectSpecItem.buyQty<1}" @click="getAmount( 3,  selectProduct.selectSpecItem.ID, updateProductsBuyQty_spec, [selectProduct, selectProduct.selectSpecItem.buyQty-1, selectProduct.selectSpecIndex,'']); "><i class="fa fa-minus"></i></div>
                  <input class="number" size="3" type="text" maxlength="3" @input="numberInput( selectProduct.selectSpecItem )"  @blur="getAmount( 3,  selectProduct.selectSpecItem.ID, updateProductsBuyQty_spec, [selectProduct, selectProduct.selectSpecItem.buyQty, selectProduct.selectSpecIndex,''])" 
                    @keyup.enter="getAmount( 3,  selectProduct.selectSpecItem.ID, updateProductsBuyQty_spec, [selectProduct, selectProduct.selectSpecItem.buyQty, selectProduct.selectSpecIndex,''])"
                    v-model="selectProduct.selectSpecItem.buyQty">
                  <div class="add" :class="{qtyDisabled:(selectProduct.selectSpecItem.Enable == 1 && selectProduct.selectSpecItem.buyQty > selectProduct.selectSpecItem.Amount - 1) || selectProduct.selectSpecItem.buyQty > 998 }" @click="getAmount( 3,  selectProduct.selectSpecItem.ID, updateProductsBuyQty_spec, [selectProduct, selectProduct.selectSpecItem.buyQty*1+1, selectProduct.selectSpecIndex,'']); "><i class="fa fa-plus"></i></div>
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
                  <div class="reduce" :class="{qtyDisabled:selectProduct.buyQty<1}" @click="getAmount( 1,  selectProduct.ID, updateProductsBuyQty, [selectProduct, selectProduct.buyQty-1,'']);  "><i class="fa fa-minus"></i></div>
                  <input class="number" size="3" type="text" maxlength="3" @input="numberInput_2"  @blur="getAmount( 1,  selectProduct.ID, updateProductsBuyQty, [selectProduct, selectProduct.buyQty,''])" 
                    @keyup.enter="getAmount( 1,  selectProduct.ID, updateProductsBuyQty, [selectProduct, selectProduct.buyQty,''])"
                    v-model="selectProduct.buyQty">
                  <div class="add" :class="{qtyDisabled:(selectProduct.Enable == 1 && selectProduct.buyQty > selectProduct.Amount - 1) || selectProduct.buyQty > 998 }" @click="getAmount( 1,  selectProduct.ID, updateProductsBuyQty, [selectProduct, selectProduct.buyQty*1+1,'']); "><i class="fa fa-plus"></i></div>
                </div>
                <div class="discontinued" v-show="store.Enable === '0'">停售中</div>
                <div class="discontinued" v-show="selectProduct.Enable == 1 && selectProduct.Amount == 0">暫無庫存</div>
              </template>

              <div class="share_link" @click="click_share_link">
                分享
                <i class="fas fa-share"></i>
              </div>

              <input type="text" id="copy_input2" readonly>
          </div>
        </div>

        <div class="addPrice" v-if="selectProduct.addPrice && selectProduct.addPrice.length">
          <div class="title">
            加價購
            <i v-if="isAddPrice" class="fa-solid fa-caret-up" @click="isAddPrice = false"></i>
            <i v-else class="fa-solid fa-caret-down" @click="isAddPrice = true"></i>
          </div>
          <ul v-show="isAddPrice">
            <div class="ulMask" v-if=" (!selectProduct.specArr && selectProduct.Enable == 1 && selectProduct.Amount == 0) || (selectProduct.specArr && selectProduct.selectSpecItem.Enable == 1 && selectProduct.selectSpecItem.Amount == 0) "></div>
            <li v-for="(item,index) in selectProduct.addPrice" :key="item.ID">
              <div class="pic_div">
                <div class="pic" :style="{backgroundImage :`url(${item.Img})`,}"></div>
              </div>
              <div class="content">
                <div class="title">{{item.Name}}</div>
                <!-- 多價格 singleProduct 加價購 info -->
                <template v-if="item.PriceType === 'onePrice'">
                  <div class="price">NT$ {{ numberThousands(item.Price) }}</div>
                </template>
                <template v-else>
                  <template v-if="item.selectSpecItem && item.selectSpecItem.ID">
                    <div class="price">NT$ {{ numberThousands(item.selectSpecItem.ItemNowPrice) }}</div>
                  </template>
                  <template v-else>
                    <div class="price">NT$ {{ item.nowPriceRange }}</div>
                  </template>
                </template>
                
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
          <div class="title">
            商品詳情
            <i v-if="isDetail" class="fa-solid fa-caret-up" @click="isDetail = false"></i>
            <i v-else class="fa-solid fa-caret-down" @click="isDetail = true"></i>
          </div>
          <div v-show="isDetail" class="content ql-editor" ref='selectProduct_detail_content' v-html="unescapeHTML(selectProduct.Detail)"></div>
        </div>

        <div class="others" v-show="carts.length">
          <div class="title"> 立即購買 </div>
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

          <div class="stepOne" v-show="stepIndex === 1">
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
                        <!-- 多價格 singleProduct table 主商品單價 -->
                        <div class="td price" v-if="item.priceType === 'onePrice'"> NT$ {{numberThousands(item.NowPrice)}} </div>
                        <div class="td price" v-else> NT$ {{numberThousands(spec.ItemNowPrice)}} </div>
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
                        <!-- 多價格 singleProduct table 主商品小計 -->
                        <div class="td subtotal" v-if="item.priceType === 'onePrice'"> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{numberThousands(item.NowPrice * (isNaN(spec.buyQty) ? 0 : spec.buyQty))}} </div>  </div>
                        <div class="td subtotal" v-else> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{numberThousands(spec.ItemNowPrice * (isNaN(spec.buyQty) ? 0 : spec.buyQty))}} </div>  </div>
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
                        <div class="td price">  NT$ {{numberThousands(item.NowPrice)}} </div>
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
                        <div class="td subtotal"> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{numberThousands(item.NowPrice * (isNaN(item.buyQty) ? 0 : item.buyQty))}}</div>  </div>
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
                            <!-- 多價格 singleProduct table 加價購 單價 -->
                            <div class="td price" v-if="item2.PriceType === 'onePrice'">  NT$ {{numberThousands(item2.Price)}} </div>
                            <div class="td price" v-else>  NT$ {{ spec2.Price }} </div>

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
                            <!-- 多價格 singleProduct table 加價購 小計 -->
                            <div class="td subtotal" v-if="item2.PriceType === 'onePrice'"> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{numberThousands(item2.Price * (isNaN(spec2.buyQty) ? 0 : spec2.buyQty))}} </div>  </div>
                            <div class="td subtotal" v-else> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{numberThousands(spec2.Price * (isNaN(spec2.buyQty) ? 0 : spec2.buyQty))}} </div>  </div>

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
                            <div class="td price"> NT$ {{numberThousands(item2.Price)}} </div>
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
                            <div class="td subtotal"> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{numberThousands(item2.Price * (isNaN(item2.Qty) ? 0 : item2.Qty))}} </div> </div>
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
                <div class="button" @click="discount">套用</div>
                <div class="button" @click="unDiscount">取消</div>
              </div>
              <div class="discountError" v-if="isDiscountMessage">{{discountMessage}}</div>
            </div>

            <div class="total" v-show="total">
              <ul>
                <li>
                  <div class="before">商品金額</div>
                  <div class="after">NT$ {{numberThousands(total.Total)}}</div>
                </li>
                <li>
                  <div class="before">- 折扣</div>
                  <div class="after">NT$ {{numberThousands(total.Discount)}}</div>
                </li>
                <li>
                  <div class="before">- 折扣碼優惠</div>
                  <div class="after">NT$ {{numberThousands(total.DiscountCode)}}</div>
                </li>
                <li>
                  <div class="before">小計</div>
                  <div class="after" v-if="(parseInt(total.Total) - parseInt(total.Discount) - parseInt(total.DiscountCode)) >= 0">
                    NT$ {{numberThousands(parseInt(total.Total) - parseInt(total.Discount) - parseInt(total.DiscountCode))}}
                  </div>
                  <div class="after" v-else>
                    NT$ 0
                  </div>
                </li>
                <hr>
                <li v-if="is_use_bonus && use_bonus > 0">
                  <div class="before">- 購物金</div>
                  <div class="after">NT$ {{numberThousands(use_bonus)}}</div>
                </li>
                <li>
                  <div class="before">金額總計</div>
                  <div class="after">NT$ {{numberThousands(total.Sum)}}</div>
                </li>
              </ul>
            </div>
            <div class="next" @click="stepOneToTwo()">下一步</div>
          </div>

          <div class="stepTwo" v-show="stepIndex === 2">
            <div class="title">
              填寫購買人資訊
            </div>
            <form class="info">
              <div class="left">
                <label for="email">購買人Email</label>
                <template v-if="user_account && userInfo.Registermethod == 2">
                  <input type="text" id="email" name="email" placeholder="email" @blur="validate('purchaser_email', 'required', 'email')"
                  :class="{inputError: info.purchaser_email_error}" v-model="info.purchaser_email">
                    <div class="prompt"> {{ info.purchaser_email_error }} </div>
                </template>
                <template v-else>
                  <input type="text" :readonly="!!userInfo.Email" id="email" name="email" placeholder="email" @blur="validate('purchaser_email', 'required', 'email')"
                    :class="{inputError: info.purchaser_email_error}" v-model="info.purchaser_email">
                  <div class="prompt"> {{ info.purchaser_email_error }} </div>
                </template>

                <label for="name">購買人姓名</label>
                <input type="text" :readonly="userInfo.Registermethod < 2" id="name" name="姓名" :class="{inputError: info.purchaser_name_error }" placeholder="姓名" v-model="info.purchaser_name" @change="pInput" @blur="validate('purchaser_name', 'required', 'name', 'nameLength')">
                <div class="prompt">
                  {{ info.purchaser_name_error }}
                  <span v-if="user_account && info.purchaser_name_error" @click="urlPush(getPathname('info'))"> 前往修改會員姓名 </span> 
                </div>

                <label for="phone">購買人手機號碼</label>
                <input type="text" :readonly="!!userInfo.Phone2" id="phone" name="購買人手機號碼" :class="{inputError: info.purchaser_number_error }" placeholder="購買人手機號碼" v-model="info.purchaser_number" @change="pInput" @blur="validate('purchaser_number', 'required', 'phone')">
                <div class="prompt">{{ info.purchaser_number_error }}</div>

                <div class="custom_option" @click="isSame = !isSame" style="padding: 5px; margin-top: 10px;">
                  <label>收件人同購買人資料</label>
                  <i class="fa-regular fa-square-check" v-if="isSame"></i>
                  <i class="fa-regular fa-square" v-else></i>
                </div>
                
                <label for="rname">收件人姓名</label>
                <input type="text" id="rname" name="收件人姓名" :class="{inputError: info.receiver_name_error }" placeholder="姓名" v-model="info.receiver_name" @blur="validate('receiver_name', 'required', 'name', 'nameLength')">
                <div class="prompt">{{ info.receiver_name_error }}</div>
                
                <label for="rphone">收件人聯絡電話</label>
                <input type="text" id="rphone" name="收件人聯絡電話" :class="{inputError: info.receiver_number_error }" placeholder="聯絡電話" v-model="info.receiver_number" @blur="validate('receiver_number', 'required')">
                <div class="prompt">{{ info.receiver_number_error }}</div>

                <label for="feedback">留言給我們</label>
                <textarea name="" id="feedback" cols="30" rows="5" placeholder="留言給我們" v-model="info.info_message" @input="info_message_input"></textarea>
                <div class="info_messageLength"> {{info.info_message.length}}/150 </div>
              </div>

              <div class="right">
                <!-- 運送方式 -->
                <label for="transport">運送方式</label>
                <template v-if="transport_number < 6">
                  <div class="custom_option2" :class="{active:transport === '1'}" 
                    @click="transport = '1'" v-if="store.Shipping === '1' || store.Shipping === '2'"
                  > 
                    一般宅配
                  </div>
                  <div class="custom_option2" :class="{active:transport === '2'}" 
                    @click="transport = '2'" v-if="store.Shipping === '1' || store.Shipping === '3'"
                  > 
                    到店自取
                  </div>
                  <!-- 7-11 -->
                  <div class="custom_option2" :class="{active:transport === 'UNIMARTDelivery' || transport === 'UNIMARTC2CDelivery'}" 
                    @click="transport = store.UNIMARTDelivery ? 'UNIMARTDelivery' : 'UNIMARTC2CDelivery'" 
                    v-if="store.UNIMARTDelivery || store.UNIMARTC2CDelivery"
                  > 
                    7-11 取貨付款
                  </div>
                  <div class="custom_option2" :class="{active:transport === 'UNIMART' || transport === 'UNIMARTC2C'}" 
                    @click="transport = store.UNIMART ? 'UNIMART' : 'UNIMARTC2C'" 
                    v-if="store.UNIMART || store.UNIMARTC2C"
                  > 
                    7-11 取貨不付款
                  </div>
                  <div class="custom_option2" :class="{active:transport === 'UNIMARTFREEZEDelivery'}" 
                    @click="transport = 'UNIMARTFREEZEDelivery'" 
                    v-if="store.UNIMARTFREEZEDelivery"
                  > 
                    7-11冷凍 取貨付款
                  </div>
                  <div class="custom_option2" :class="{active:transport === 'UNIMARTFREEZE'}" 
                    @click="transport = 'UNIMARTFREEZE'" 
                    v-if="store.UNIMARTFREEZE"
                  > 
                    7-11冷凍 取貨不付款
                  </div>

                  <!-- 全家 -->
                  <div class="custom_option2" :class="{active:transport === 'FAMIDelivery' || transport === 'FAMIC2CDelivery'}" 
                    @click="transport = store.FAMIDelivery ? 'FAMIDelivery' : 'FAMIC2CDelivery'" 
                    v-if="store.FAMIDelivery || store.FAMIC2CDelivery"
                  > 
                    全家 取貨付款
                  </div>
                  <div class="custom_option2" :class="{active:transport === 'FAMI' || transport === 'FAMIC2C'}" 
                    @click="transport = store.FAMI ? 'FAMI' : 'FAMIC2C'" 
                    v-if="store.FAMI || store.FAMIC2C"
                  > 
                    全家 取貨不付款
                  </div>

                  <!-- 萊爾富 -->
                  <div class="custom_option2" :class="{active:transport === 'HILIFEDelivery' || transport === 'HILIFEC2CDelivery'}" 
                    @click="transport = store.HILIFEDelivery ? 'HILIFEDelivery' : 'HILIFEC2CDelivery'" 
                    v-if="store.HILIFEDelivery || store.HILIFEC2CDelivery"
                  > 
                    萊爾富 取貨付款
                  </div>
                  <div class="custom_option2" :class="{active:transport === 'HILIFE' || transport === 'HILIFEC2C'}" 
                    @click="transport = store.HILIFE ? 'HILIFE' : 'HILIFEC2C'" 
                    v-if="store.HILIFE || store.HILIFEC2C"
                  > 
                    萊爾富 取貨不付款
                  </div>

                  <!-- OK超商 -->
                  <div class="custom_option2" :class="{active:transport === 'OKMARTC2CDelivery'}" 
                    @click="transport = 'OKMARTC2CDelivery'" 
                    v-if="store.OKMARTC2CCDelivery"
                  > 
                    OK超商 取貨付款
                  </div>
                  <div class="custom_option2" :class="{active:transport === 'OKMARTC2C'}" 
                    @click="transport = 'OKMARTC2C'" 
                    v-if="store.OKMARTC2C"
                  > 
                    OK超商 取貨不付款
                  </div>
                </template>
                <template v-else>
                  <div tabindex="0" class="select" @click="is_show_transport_options = !is_show_transport_options" @blur="is_show_transport_options = false"> 
                    <div class="text">{{ transport !== '0' ? transport_obj[transport] : "請選擇運送方式" }}</div>
                    <div class="icon" :class="{iconActive:is_show_transport_options}"> <i class="fa fa-caret-down" aria-hidden="true"></i> </div>
                    <ul class="option" :class="{showOption:is_show_transport_options}">                                                               
                      <li @click.stop="transport = '1'; is_show_transport_options = false" v-if="store.Shipping === '1' || store.Shipping === '2'"> 一般宅配 </li>
                      <li @click.stop="transport = '2'; is_show_transport_options = false" v-if="store.Shipping === '1' || store.Shipping === '3'"> 到店自取 </li>

                      <!-- 7-11 -->
                      <li @click.stop="transport = store.UNIMARTDelivery ? 'UNIMARTDelivery' : 'UNIMARTC2CDelivery'; is_show_transport_options = false" 
                        v-if="store.UNIMARTDelivery || store.UNIMARTC2CDelivery"
                      > 
                        7-11 取貨付款 
                      </li>
                      <li @click.stop="transport = store.UNIMART ? 'UNIMART' : 'UNIMARTC2C'; is_show_transport_options = false" 
                        v-if="store.UNIMART || store.UNIMARTC2C"
                      > 
                        7-11 取貨不付款 
                      </li>
                      <li @click.stop="transport = 'UNIMARTFREEZEDelivery'; is_show_transport_options = false" 
                        v-if="store.UNIMARTFREEZEDelivery"
                      > 
                        7-11冷凍 取貨付款 
                      </li>
                      <li @click.stop="transport = 'UNIMARTFREEZE'; is_show_transport_options = false" 
                        v-if="store.UNIMARTFREEZE"
                      > 
                        7-11冷凍 取貨不付款 
                      </li>

                      <!-- 全家 -->
                      <li @click.stop="transport = store.FAMIDelivery ? 'FAMIDelivery' : 'FAMIC2CDelivery'; is_show_transport_options = false" 
                        v-if="store.FAMIDelivery || store.FAMIC2CDelivery"
                      > 
                        全家 取貨付款 
                      </li>
                      <li @click.stop="transport = store.FAMI ? 'FAMI' : 'FAMIC2C'; is_show_transport_options = false" 
                        v-if="store.FAMI || store.FAMIC2C"
                      > 
                        全家 取貨不付款 
                      </li>

                      <!-- 萊爾富 -->
                      <li @click.stop="transport = store.HILIFEDelivery ? 'HILIFEDelivery' : 'HILIFEC2CDelivery'; is_show_transport_options = false" 
                        v-if="store.HILIFEDelivery || store.HILIFEC2CDelivery"
                      > 
                        萊爾富 取貨付款 
                      </li>
                      <li @click.stop="transport = store.HILIFE ? 'HILIFE' : 'HILIFEC2C'; is_show_transport_options = false" 
                        v-if="store.HILIFE || store.HILIFEC2C"
                      > 
                        萊爾富 取貨不付款 
                      </li>

                      <!-- OK超商 -->
                      <li @click.stop="transport = 'OKMARTC2CDelivery'; is_show_transport_options = false" 
                        v-if="store.OKMARTC2CCDelivery"
                      > 
                        OK超商 取貨付款 
                      </li>
                      <li @click.stop="transport = 'OKMARTC2C'; is_show_transport_options = false" 
                        v-if="store.OKMARTC2C"
                      > 
                        OK超商 取貨不付款 
                      </li>
                    </ul>
                  </div>
                </template>
                <div class="prompt" v-if="is_click_finish_order && transport === '0'"> 請選擇配送方式 </div>

                <!-- 支付方式 -->
                <label for="pay_method">支付方式</label>
                <div class="custom_select" v-if="store.paymethodOrder">
                  <div class="custom_option2" :class="{active:pay_method === 'CreditCard'}" :style="`order: ${store.paymethodOrder['CreditCard']}`" @click="pay_method = 'CreditCard'" v-if="store.CreditCard != 0 && !is_collection"> 
                    信用卡
                  </div>
                  <div class="custom_option2" :class="{active:pay_method === 'ATM'}" :style="`order: ${store.paymethodOrder['ATM']}`" @click="pay_method = 'ATM'" v-if="store.ATM != 0 && !is_collection"> 
                    ATM/網路ATM
                  </div>
                  <div class="custom_option2" :class="{active:pay_method === 'PayCode'}" :style="`order: ${store.paymethodOrder['PayCode']}`" @click="pay_method = 'PayCode'" v-if="store.PayCode != 0 && !is_collection"> 
                    超商代碼
                  </div>
                  <div class="custom_option2" :class="{active:pay_method === 'PayBarCode'}" :style="`order: ${store.paymethodOrder['PayBarCode']}`" @click="pay_method = 'PayBarCode'" v-if="store.PayBarCode != 0 && !is_collection"> 
                    超商條碼
                  </div>
                  <div class="custom_option2" :class="{active:pay_method === 'PayOnDelivery'}" :style="`order: ${store.paymethodOrder['PayOnDelivery']}`" @click="pay_method = 'PayOnDelivery'" v-if="store.PayOnDelivery != 0 && !is_store"> 
                    取貨付款
                  </div>
                  <div class="custom_option2" :class="{active:pay_method === 'LinePay'}" :style="`order: ${store.paymethodOrder['LinePay']}`" @click="pay_method = 'LinePay'" v-if="store.LinePay == 1 && !is_collection"> 
                    LINE Pay
                  </div>

                  <!-- 超商取貨付款 -->
                  <div class="custom_option2" :class="{active:pay_method === 'MartPayOnDelivery'}" :style="`order: ${store.paymethodOrder['PayOnDelivery']}`" @click="pay_method = 'MartPayOnDelivery'" v-if="is_collection"> 
                    超商取貨付款
                  </div>
                </div>
                <div class="prompt" v-if="is_click_finish_order && pay_method === '0'"> 請選擇支付方式 </div>

                <!-- 一般宅配 地址 -->
                <template v-if="transport == '1'">
                  <label for="raddress">
                    收件地址
                    <template v-if="userInfo.address_obj && Object.keys(userInfo.address_obj).length < 3 && !has_address">
                      <input style="margin-left: 10px;" type="checkbox" id="is_save_address" v-model="is_save_address">
                      <label for="is_save_address"> 加入常用地址 </label>
                    </template>
                  </label>
                  <div tabindex="0" class="select" :class="{inputError: is_click_finish_order && city_active == ''}"
                    @click="is_show_city_options = !is_show_city_options" 
                    @blur="is_show_city_options = false"
                  > 
                    <div class="text">{{ city_active !== '' ? city_active : "請選擇城市" }}</div>
                    <div class="icon" :class="{iconActive:is_show_city_options}"> <i class="fa fa-caret-down" aria-hidden="true"></i> </div>
                    <ul class="option" :class="{showOption:is_show_city_options}">                                                               
                      <li v-for="(value, city) in city_district" :key="city" 
                        @click.stop="city_active = city; is_show_city_options = false"
                      > 
                        {{ city }}
                      </li>
                    </ul>
                  </div>
                  <div tabindex="0" class="select" :class="{inputError: is_click_finish_order && district_active == ''}"
                    @click="is_show_district_options = !is_show_district_options" 
                    @blur="is_show_district_options = false"
                  > 
                    <div class="text">{{ district_active !== '' ? district_active : "請選擇鄉鎮市區" }} {{ district_active ? city_district[city_active][district_active] : '' }}</div>
                    <div class="icon" :class="{iconActive:is_show_district_options}"> <i class="fa fa-caret-down" aria-hidden="true"></i> </div>
                    <ul class="option" :class="{showOption:is_show_district_options}">                                                               
                      <li v-for="(zipCode, district) in city_district[city_active]" :key="district"
                        @click.stop="district_active = district; is_show_district_options = false"
                      > 
                        {{ district }} {{ zipCode }}
                      </li>
                    </ul>
                  </div>

                  <div style="display: flex;" class="input_container">
                    <input style="width: 100%;" type='text' placeholder="請輸入詳細地址" v-model.trim='detail_address' :class="{inputError: is_click_finish_order && detail_address == ''}">
                  </div>
                  <div class="prompt" v-if="is_click_finish_order && (!city_active || !district_active || !detail_address)"> 請輸入收件地址 </div>
                  <div class="address" v-if="userInfo.address_obj && Object.keys(userInfo.address_obj).length">
                    <div class="address_title"> 常用地址 : </div>
                    <ul>
                      <li v-for="(item, key) in userInfo.address_obj" :key="key" @click="city_active = item.address.split(' ')[0]; district_active = item.address.split(' ')[1]; detail_address = item.address.split(' ')[2];"> {{ }} 
                        {{ item.address }}
                        <i class="fa-regular fa-square-check" v-if="item.address == receiver_address"></i>
                        <i class="fa-regular fa-square" v-else></i>
                      </li>
                    </ul>
                  </div>
                </template>

                <!-- 超商取貨 選擇門市 -->
                <template v-if="is_store">
                  <label v-if="!storeid" > 請選擇門市 </label>
                  <div class="store_info" v-else >
                    <div v-if="storeid"> 門市店號: {{ storeid }} </div>
                    <div v-if="storename"> 門市名稱: {{ storename }} </div>
                    <div v-if="storeaddress"> 門市地址: {{ storeaddress }} </div>
                  </div>
                  <div class="button2" v-if="!storeid || !storename || !storeaddress" @click="pickStore"> 搜尋門市 </div>
                  <div class="button2" v-else @click="pickStore"> 更改門市 </div>
                  <div class="prompt" v-if="is_click_finish_order && storeaddress == ''"> 請選擇門市 </div>
                </template>

                <!-- 發票 -->
                <template v-if="store.Receipt === '1'">
                  <label>發票類型</label>
                  <div class="custom_option2" :class="{active:personal_or_company === '個人發票'}" @click="personal_or_company = '個人發票'; invoice_type = is_other_invoice_type ? '0' : '1'">
                    個人發票
                  </div>
                  <div class="custom_option2" :class="{active:personal_or_company === '公司發票'}" @click="personal_or_company = '公司發票'; invoice_type = '2'"> 
                    公司發票
                  </div>

                  <template v-if="personal_or_company === '個人發票' && is_other_invoice_type">
                    <label>個人發票類型</label>

                    <div class="custom_option2" :class="{active:invoice_type === '1'}" @click="invoice_type = '1'"> 
                      個人紙本發票
                    </div>
                    <div class="custom_option2" v-if="store.NatureCode === '1'" :class="{active:invoice_type === '3'}" @click="invoice_type = '3'"> 
                      手機條碼載具
                    </div>
                    <div v-if="invoice_type === '3'">
                      <input type="text" placeholder="手機條碼載具" v-model="phone_barCode">
                      <div class="prompt" v-if="is_click_finish_order && phone_barCode === ''"> 請填寫手機條碼載具 </div>
                    </div>
                    <div class="custom_option2" v-if="store.NatureCode === '1'" :class="{active:invoice_type === '4'}" @click="invoice_type = '4'"> 
                      自然人憑證載具
                    </div>
                    <div v-if="invoice_type === '4'">
                      <input type="text" placeholder="自然人憑證載具" v-model="natural_barCode">
                      <div class="prompt" v-if="is_click_finish_order && natural_barCode === ''"> 請填寫自然人憑證載具 </div>
                    </div>
                  </template>

                  <div class="prompt" v-if="is_click_finish_order && invoice_type === '0'"> 請選擇發票類型 </div>

                  <template v-if="invoice_type === '2'">
                    <div>
                      <input type="text" id="invoice_title" name="公司抬頭" placeholder="公司抬頭" v-model="invoice_title">
                      <div class="prompt" v-if="is_click_finish_order && invoice_title === ''"> 請填寫公司抬頭 </div>
                    </div>
                    <div>
                      <input type="text" id="invoice_uniNumber" name="統一編號" placeholder="統一編號" v-model="invoice_uniNumber">
                      <div class="prompt" v-if="is_click_finish_order && invoice_uniNumber === ''"> 請填寫統一編號 </div>
                    </div>
                  </template>
                </template>
              </div>
            </form>

            <!--  有點數 或 有設定回饋% -->
            <template v-if="total_bonus * 1 || bonus_array.length">
              <div class="title">
                購物金 
                <span v-if="bonus_array.length">
                  (<span v-if="!user_account" > 會員 </span>
                  <span> 訂單完成後 </span>
                  <template v-for="(item, index) in bonus_array" :key="index">
                    <template v-if="item.shipping">
                      <template v-if="item.lower == 0">
                        ，消費即送 {{ item.shipping }}% 購物金
                      </template>
                      <template v-else>
                        ，滿 NT${{ numberThousands(item.lower) }} 送 {{ item.shipping }}% 購物金 
                      </template>
                    </template>
                  </template>)
                </span>
              </div>
              <div class="info" v-if="user_account">
                <div class="left">
                  <div class="bonus_container">
                    購物金餘額: <span class="bonus"> {{numberThousands(total_bonus < 0 ? 0 : total_bonus)}} 點 </span>
                  </div>
                  <div class="box" v-if="total_bonus * 1">
                    <input type="checkbox" id="is_use_bonus" v-model="is_use_bonus" @change="use_bonus_handler"> 
                    <label for="is_use_bonus" > 使用購物金 </label>
                    <input type="number" placeholder="購物金" v-model="use_bonus" @blur="use_bonus_handler">
                  </div>
                </div>
                <div class="right"></div>
              </div>
              <div class="info login" v-else>
                請先 <span class="a" @click="urlPush(getPathname('user'))"> 登入會員 </span>
              </div>
            </template>

            <div class="total">
              <ul>
                <li>
                  <div class="before">商品金額</div>
                  <div class="after">NT$ {{numberThousands(total.Total)}}</div>
                </li>
                <li>
                  <div class="before">- 折扣</div>
                  <div class="after">NT$ {{numberThousands(total.Discount)}}</div>
                </li>
                <li>
                  <div class="before">- 折扣碼優惠</div>
                  <div class="after">NT$ {{numberThousands(total.DiscountCode)}}</div>
                </li>
                <li>
                  <div class="before">小計</div>

                  <div class="after" v-if="(parseInt(total.Total) - parseInt(total.Discount) - parseInt(total.DiscountCode)) >= 0">
                    NT$ {{numberThousands(parseInt(total.Total) - parseInt(total.Discount) - parseInt(total.DiscountCode))}}
                  </div>
                  <div class="after" v-else>
                    NT$ 0
                  </div>
                </li>
                <hr>
                <li v-if="is_use_bonus && use_bonus > 0">
                  <div class="before">- 購物金</div>
                  <div class="after">NT$ {{numberThousands(use_bonus)}}</div>
                </li>
                <li>
                  <div class="before">+ 運費</div>
                  <div class="after">NT$ {{numberThousands(total.Shipping)}}</div>
                </li>
                <li>
                  <div class="before"> 金額總計 </div>
                  <div class="after">NT$ {{numberThousands(total.Sum)}}</div>
                </li>
                <template v-if="user_account && total">
                  <hr>
                  <li>
                    訂單完成後獲得 NT${{ numberThousands(member_bonus) }} 購物金
                  </li>
                  <li>
                    (購物金將在出貨日滿14天後獲得)
                  </li>
                </template>
              </ul>
            </div>
            
            <div class="buttonGroup">
              <div class="button" @click="stepIndex = 1; getProducts()">上一步</div>
              <div class="button" @click="checkOrder()"><i  v-show="orderIng" class="fas fa-spinner fa-spin" style="margin-right: 5px"></i>完成訂單</div>
            </div>
          </div>

          <div class="noItem" v-show="cartsLength === 0">
            <p> 購物車是空的?? </p>
            <p> 趕緊手刀買起來!! </p> 
            <div class="button" @click="showPage='main'"> 現在就去逛! </div>
          </div>

          <div class="footer">
            <div class="top"></div>
            <div class="bottom">POWERED AND SECURED BY UNIQ Micronet</div>
          </div>
        </div>
      </div>
    </div>

    <div class="cart" v-if="showPage === 'cart'" :style="`height:${innerHeight}px`">
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
                      <!-- 多價格 cart table 主商品 單價 -->
                      <div class="td price" v-if="item.priceType === 'onePrice'"> NT$ {{numberThousands(item.NowPrice)}} </div>
                      <div class="td price" v-else> NT$ {{numberThousands(spec.ItemNowPrice)}} </div>
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
                      <!-- 多價格 cart table 主商品 小計 -->
                      <div class="td subtotal" v-if="item.priceType === 'onePrice'"> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{numberThousands(item.NowPrice * (isNaN(spec.buyQty) ? 0 : spec.buyQty))}} </div>  </div>
                      <div class="td subtotal" v-else> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{numberThousands(spec.ItemNowPrice * (isNaN(spec.buyQty) ? 0 : spec.buyQty))}} </div>  </div>
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
                      <div class="td price">  NT$ {{numberThousands(item.NowPrice)}} </div>
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
                      <div class="td subtotal"> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{numberThousands(item.NowPrice * (isNaN(item.buyQty) ? 0 : item.buyQty))}}</div>  </div>
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
                          <!-- 多價格 cart table 加價購 單價 -->
                          <div class="td price" v-if="item2.PriceType === 'onePrice'">  NT$ {{ numberThousands(item2.Price) }} </div>
                          <div class="td price" v-else>  NT$ {{ numberThousands(spec2.ItemNowPrice) }} </div>

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
                          <!-- 多價格 cart table 加價購 小計 -->
                          <div class="td subtotal" v-if="item2.PriceType === 'onePrice'"> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{numberThousands(item2.Price * (isNaN(spec2.buyQty) ? 0 : spec2.buyQty))}} </div>  </div>
                          <div class="td subtotal" v-else> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{numberThousands(spec2.ItemNowPrice * (isNaN(spec2.buyQty) ? 0 : spec2.buyQty))}} </div>  </div>
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
                          <div class="td price"> NT$ {{numberThousands(item2.Price)}} </div>
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
                          <div class="td subtotal"> <div class="priceTitle">小計</div> <div class="priceText"> NT$ {{numberThousands(item2.Price * (isNaN(item2.Qty) ? 0 : item2.Qty))}} </div> </div>
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
              <div class="button" @click="discount">套用</div>
              <div class="button" @click="unDiscount">取消</div>
            </div>
            <div class="discountError" v-if="isDiscountMessage">{{discountMessage}}</div>
          </div>

          <div class="total" v-show="total">
            <ul>
              <li>
                <div class="before">商品金額</div>
                <div class="after">NT$ {{numberThousands(total.Total)}}</div>
              </li>
              <li>
                <div class="before">- 折扣</div>
                <div class="after">NT$ {{numberThousands(total.Discount)}}</div>
              </li>
              <li>
                <div class="before">- 折扣碼優惠</div>
                <div class="after">NT$ {{numberThousands(total.DiscountCode)}}</div>
              </li>
              <li>
                <div class="before">小計</div>
                <div class="after" v-if="(parseInt(total.Total) - parseInt(total.Discount) - parseInt(total.DiscountCode)) >= 0">
                  NT$ {{numberThousands(parseInt(total.Total) - parseInt(total.Discount) - parseInt(total.DiscountCode))}}
                </div>
                <div class="after" v-else>
                  NT$ 0
                </div>
              </li>
              <hr>
              <li v-if="is_use_bonus && use_bonus > 0">
                <div class="before">- 購物金</div>
                <div class="after">NT$ {{numberThousands(use_bonus)}}</div>
              </li>
              <li>
                <div class="before">金額總計</div>
                <div class="after">NT$ {{numberThousands(total.Sum)}}</div>
              </li>
            </ul>
          </div>
          <div class="next" @click="stepOneToTwo()">下一步</div>
        </div>

        <div class="stepTwo" v-show="(cartsLength !== 0 )&& stepIndex === 2">
          <div class="title">
            填寫購買人資訊
          </div>
          <form class="info">
            <div class="left">
              <label for="email">購買人Email</label>
              <template v-if="user_account && userInfo.Registermethod == 2">
                <input type="text" id="email" name="email" placeholder="email" @blur="validate('purchaser_email', 'required', 'email')"
                :class="{inputError: info.purchaser_email_error}" v-model="info.purchaser_email">
                  <div class="prompt"> {{ info.purchaser_email_error }} </div>
              </template>
              <template v-else>
                <input type="text" :readonly="!!userInfo.Email" id="email" name="email" placeholder="email" @blur="validate('purchaser_email', 'required', 'email')"
                  :class="{inputError: info.purchaser_email_error}" v-model="info.purchaser_email">
                <div class="prompt"> {{ info.purchaser_email_error }} </div>
              </template>

              <label for="name">購買人姓名</label>
              <input type="text" :readonly="userInfo.Registermethod < 2" id="name" name="姓名" :class="{inputError: info.purchaser_name_error }" placeholder="姓名" v-model="info.purchaser_name" @change="pInput" @blur="validate('purchaser_name', 'required', 'name', 'nameLength')">
              <div class="prompt">
                {{ info.purchaser_name_error }}
                <span v-if="user_account && info.purchaser_name_error" @click="urlPush(getPathname('info'))"> 前往修改會員姓名 </span> 
              </div>

              <label for="phone">購買人手機號碼</label>
              <input type="text" :readonly="!!userInfo.Phone2" id="phone" name="購買人手機號碼" :class="{inputError: info.purchaser_number_error }" placeholder="購買人手機號碼" v-model="info.purchaser_number" @change="pInput" @blur="validate('purchaser_number', 'required', 'phone')">
              <div class="prompt">{{ info.purchaser_number_error }}</div>

              <div class="custom_option" @click="isSame = !isSame" style="padding: 5px; margin-top: 10px;">
                <label>收件人同購買人資料</label>
                <i class="fa-regular fa-square-check" v-if="isSame"></i>
                <i class="fa-regular fa-square" v-else></i>
              </div>
              
              <label for="rname">收件人姓名</label>
              <input type="text" id="rname" name="收件人姓名" :class="{inputError: info.receiver_name_error }" placeholder="姓名" v-model="info.receiver_name" @blur="validate('receiver_name', 'required', 'name', 'nameLength')">
              <div class="prompt">{{ info.receiver_name_error }}</div>
              
              <label for="rphone">收件人聯絡電話</label>
              <input type="text" id="rphone" name="收件人聯絡電話" :class="{inputError: info.receiver_number_error }" placeholder="聯絡電話" v-model="info.receiver_number" @blur="validate('receiver_number', 'required')">
              <div class="prompt">{{ info.receiver_number_error }}</div>

              <label for="feedback">留言給我們</label>
              <textarea name="" id="feedback" cols="30" rows="5" placeholder="留言給我們" v-model="info.info_message" @input="info_message_input"></textarea>
              <div class="info_messageLength"> {{info.info_message.length}}/150 </div>
            </div>

            <div class="right">
              <!-- 運送方式 -->
              <label for="transport">運送方式</label>
              <template v-if="transport_number < 6">
                <div class="custom_option2" :class="{active:transport === '1'}" 
                  @click="transport = '1'" v-if="store.Shipping === '1' || store.Shipping === '2'"
                > 
                  一般宅配
                </div>
                <div class="custom_option2" :class="{active:transport === '2'}" 
                  @click="transport = '2'" v-if="store.Shipping === '1' || store.Shipping === '3'"
                > 
                  到店自取
                </div>
                <!-- 7-11 -->
                <div class="custom_option2" :class="{active:transport === 'UNIMARTDelivery' || transport === 'UNIMARTC2CDelivery'}" 
                  @click="transport = store.UNIMARTDelivery ? 'UNIMARTDelivery' : 'UNIMARTC2CDelivery'" 
                  v-if="store.UNIMARTDelivery || store.UNIMARTC2CDelivery"
                > 
                  7-11 取貨付款
                </div>
                <div class="custom_option2" :class="{active:transport === 'UNIMART' || transport === 'UNIMARTC2C'}" 
                  @click="transport = store.UNIMART ? 'UNIMART' : 'UNIMARTC2C'" 
                  v-if="store.UNIMART || store.UNIMARTC2C"
                > 
                  7-11 取貨不付款
                </div>
                <div class="custom_option2" :class="{active:transport === 'UNIMARTFREEZEDelivery'}" 
                  @click="transport = 'UNIMARTFREEZEDelivery'" 
                  v-if="store.UNIMARTFREEZEDelivery"
                > 
                  7-11冷凍 取貨付款
                </div>
                <div class="custom_option2" :class="{active:transport === 'UNIMARTFREEZE'}" 
                  @click="transport = 'UNIMARTFREEZE'" 
                  v-if="store.UNIMARTFREEZE"
                > 
                  7-11冷凍 取貨不付款
                </div>

                <!-- 全家 -->
                <div class="custom_option2" :class="{active:transport === 'FAMIDelivery' || transport === 'FAMIC2CDelivery'}" 
                  @click="transport = store.FAMIDelivery ? 'FAMIDelivery' : 'FAMIC2CDelivery'" 
                  v-if="store.FAMIDelivery || store.FAMIC2CDelivery"
                > 
                  全家 取貨付款
                </div>
                <div class="custom_option2" :class="{active:transport === 'FAMI' || transport === 'FAMIC2C'}" 
                  @click="transport = store.FAMI ? 'FAMI' : 'FAMIC2C'" 
                  v-if="store.FAMI || store.FAMIC2C"
                > 
                  全家 取貨不付款
                </div>

                <!-- 萊爾富 -->
                <div class="custom_option2" :class="{active:transport === 'HILIFEDelivery' || transport === 'HILIFEC2CDelivery'}" 
                  @click="transport = store.HILIFEDelivery ? 'HILIFEDelivery' : 'HILIFEC2CDelivery'" 
                  v-if="store.HILIFEDelivery || store.HILIFEC2CDelivery"
                > 
                  萊爾富 取貨付款
                </div>
                <div class="custom_option2" :class="{active:transport === 'HILIFE' || transport === 'HILIFEC2C'}" 
                  @click="transport = store.HILIFE ? 'HILIFE' : 'HILIFEC2C'" 
                  v-if="store.HILIFE || store.HILIFEC2C"
                > 
                  萊爾富 取貨不付款
                </div>

                <!-- OK超商 -->
                <div class="custom_option2" :class="{active:transport === 'OKMARTC2CDelivery'}" 
                  @click="transport = 'OKMARTC2CDelivery'" 
                  v-if="store.OKMARTC2CCDelivery"
                > 
                  OK超商 取貨付款
                </div>
                <div class="custom_option2" :class="{active:transport === 'OKMARTC2C'}" 
                  @click="transport = 'OKMARTC2C'" 
                  v-if="store.OKMARTC2C"
                > 
                  OK超商 取貨不付款
                </div>
              </template>
              <template v-else>
                <div tabindex="0" class="select" @click="is_show_transport_options = !is_show_transport_options" @blur="is_show_transport_options = false"> 
                  <div class="text">{{ transport !== '0' ? transport_obj[transport] : "請選擇運送方式" }}</div>
                  <div class="icon" :class="{iconActive:is_show_transport_options}"> <i class="fa fa-caret-down" aria-hidden="true"></i> </div>
                  <ul class="option" :class="{showOption:is_show_transport_options}">                                                               
                    <li @click.stop="transport = '1'; is_show_transport_options = false" v-if="store.Shipping === '1' || store.Shipping === '2'"> 一般宅配 </li>
                    <li @click.stop="transport = '2'; is_show_transport_options = false" v-if="store.Shipping === '1' || store.Shipping === '3'"> 到店自取 </li>

                    <!-- 7-11 -->
                    <li @click.stop="transport = store.UNIMARTDelivery ? 'UNIMARTDelivery' : 'UNIMARTC2CDelivery'; is_show_transport_options = false" 
                      v-if="store.UNIMARTDelivery || store.UNIMARTC2CDelivery"
                    > 
                      7-11 取貨付款 
                    </li>
                    <li @click.stop="transport = store.UNIMART ? 'UNIMART' : 'UNIMARTC2C'; is_show_transport_options = false" 
                      v-if="store.UNIMART || store.UNIMARTC2C"
                    > 
                      7-11 取貨不付款 
                    </li>
                    <li @click.stop="transport = 'UNIMARTFREEZEDelivery'; is_show_transport_options = false" 
                      v-if="store.UNIMARTFREEZEDelivery"
                    > 
                      7-11冷凍 取貨付款 
                    </li>
                    <li @click.stop="transport = 'UNIMARTFREEZE'; is_show_transport_options = false" 
                      v-if="store.UNIMARTFREEZE"
                    > 
                      7-11冷凍 取貨不付款 
                    </li>

                    <!-- 全家 -->
                    <li @click.stop="transport = store.FAMIDelivery ? 'FAMIDelivery' : 'FAMIC2CDelivery'; is_show_transport_options = false" 
                      v-if="store.FAMIDelivery || store.FAMIC2CDelivery"
                    > 
                      全家 取貨付款 
                    </li>
                    <li @click.stop="transport = store.FAMI ? 'FAMI' : 'FAMIC2C'; is_show_transport_options = false" 
                      v-if="store.FAMI || store.FAMIC2C"
                    > 
                      全家 取貨不付款 
                    </li>

                    <!-- 萊爾富 -->
                    <li @click.stop="transport = store.HILIFEDelivery ? 'HILIFEDelivery' : 'HILIFEC2CDelivery'; is_show_transport_options = false" 
                      v-if="store.HILIFEDelivery || store.HILIFEC2CDelivery"
                    > 
                      萊爾富 取貨付款 
                    </li>
                    <li @click.stop="transport = store.HILIFE ? 'HILIFE' : 'HILIFEC2C'; is_show_transport_options = false" 
                      v-if="store.HILIFE || store.HILIFEC2C"
                    > 
                      萊爾富 取貨不付款 
                    </li>

                    <!-- OK超商 -->
                    <li @click.stop="transport = 'OKMARTC2CDelivery'; is_show_transport_options = false" 
                      v-if="store.OKMARTC2CCDelivery"
                    > 
                      OK超商 取貨付款 
                    </li>
                    <li @click.stop="transport = 'OKMARTC2C'; is_show_transport_options = false" 
                      v-if="store.OKMARTC2C"
                    > 
                      OK超商 取貨不付款 
                    </li>
                  </ul>
                </div>
              </template>
              <div class="prompt" v-if="is_click_finish_order && transport === '0'"> 請選擇配送方式 </div>

              <!-- 支付方式 -->
              <label for="pay_method">支付方式</label>
              <div class="custom_select" v-if="store.paymethodOrder">
                <div class="custom_option2" :class="{active:pay_method === 'CreditCard'}" :style="`order: ${store.paymethodOrder['CreditCard']}`" @click="pay_method = 'CreditCard'" v-if="store.CreditCard != 0 && !is_collection"> 
                  信用卡
                </div>
                <div class="custom_option2" :class="{active:pay_method === 'ATM'}" :style="`order: ${store.paymethodOrder['ATM']}`" @click="pay_method = 'ATM'" v-if="store.ATM != 0 && !is_collection"> 
                  ATM/網路ATM
                </div>
                <div class="custom_option2" :class="{active:pay_method === 'PayCode'}" :style="`order: ${store.paymethodOrder['PayCode']}`" @click="pay_method = 'PayCode'" v-if="store.PayCode != 0 && !is_collection"> 
                  超商代碼
                </div>
                <div class="custom_option2" :class="{active:pay_method === 'PayBarCode'}" :style="`order: ${store.paymethodOrder['PayBarCode']}`" @click="pay_method = 'PayBarCode'" v-if="store.PayBarCode != 0 && !is_collection"> 
                  超商條碼
                </div>
                <div class="custom_option2" :class="{active:pay_method === 'PayOnDelivery'}" :style="`order: ${store.paymethodOrder['PayOnDelivery']}`" @click="pay_method = 'PayOnDelivery'" v-if="store.PayOnDelivery != 0 && !is_store"> 
                  取貨付款
                </div>
                <div class="custom_option2" :class="{active:pay_method === 'LinePay'}" :style="`order: ${store.paymethodOrder['LinePay']}`" @click="pay_method = 'LinePay'" v-if="store.LinePay == 1 && !is_collection"> 
                  LINE Pay
                </div>

                <!-- 超商取貨付款 -->
                <div class="custom_option2" :class="{active:pay_method === 'MartPayOnDelivery'}" :style="`order: ${store.paymethodOrder['PayOnDelivery']}`" @click="pay_method = 'MartPayOnDelivery'" v-if="is_collection"> 
                  超商取貨付款
                </div>
              </div>
              <div class="prompt" v-if="is_click_finish_order && pay_method === '0'"> 請選擇支付方式 </div>

              <!-- 一般宅配 地址 -->
              <template v-if="transport == '1'">
                <label for="raddress">
                  收件地址
                  <template v-if="userInfo.address_obj && Object.keys(userInfo.address_obj).length < 3 && !has_address">
                    <input style="margin-left: 10px;" type="checkbox" id="is_save_address" v-model="is_save_address">
                    <label for="is_save_address"> 加入常用地址 </label>
                  </template>
                </label>
                <div tabindex="0" class="select" :class="{inputError: is_click_finish_order && city_active == ''}"
                  @click="is_show_city_options = !is_show_city_options" 
                  @blur="is_show_city_options = false"
                > 
                  <div class="text">{{ city_active !== '' ? city_active : "請選擇城市" }}</div>
                  <div class="icon" :class="{iconActive:is_show_city_options}"> <i class="fa fa-caret-down" aria-hidden="true"></i> </div>
                  <ul class="option" :class="{showOption:is_show_city_options}">                                                               
                    <li v-for="(value, city) in city_district" :key="city" 
                      @click.stop="city_active = city; is_show_city_options = false"
                    > 
                      {{ city }}
                    </li>
                  </ul>
                </div>
                <div tabindex="0" class="select" :class="{inputError: is_click_finish_order && district_active == ''}"
                  @click="is_show_district_options = !is_show_district_options" 
                  @blur="is_show_district_options = false"
                > 
                  <div class="text">{{ district_active !== '' ? district_active : "請選擇鄉鎮市區" }} {{ district_active ? city_district[city_active][district_active] : '' }}</div>
                  <div class="icon" :class="{iconActive:is_show_district_options}"> <i class="fa fa-caret-down" aria-hidden="true"></i> </div>
                  <ul class="option" :class="{showOption:is_show_district_options}">                                                               
                    <li v-for="(zipCode, district) in city_district[city_active]" :key="district"
                      @click.stop="district_active = district; is_show_district_options = false"
                    > 
                      {{ district }} {{ zipCode }}
                    </li>
                  </ul>
                </div>

                <div style="display: flex;" class="input_container">
                  <input style="width: 100%;" type='text' placeholder="請輸入詳細地址" v-model.trim='detail_address' :class="{inputError: is_click_finish_order && detail_address == ''}">
                </div>
                <div class="prompt" v-if="is_click_finish_order && (!city_active || !district_active || !detail_address)"> 請輸入收件地址 </div>
                <div class="address" v-if="userInfo.address_obj && Object.keys(userInfo.address_obj).length">
                  <div class="address_title"> 常用地址 : </div>
                  <ul>
                    <li v-for="(item, key) in userInfo.address_obj" :key="key" @click="city_active = item.address.split(' ')[0]; district_active = item.address.split(' ')[1]; detail_address = item.address.split(' ')[2];"> {{ }} 
                      {{ item.address }}
                      <i class="fa-regular fa-square-check" v-if="item.address == receiver_address"></i>
                      <i class="fa-regular fa-square" v-else></i>
                    </li>
                  </ul>
                </div>
              </template>

              <!-- 超商取貨 選擇門市 -->
              <template v-if="is_store">
                <label v-if="!storeid" > 請選擇門市 </label>
                <div class="store_info" v-else>
                  <div v-if="storeid"> 門市店號: {{ storeid }} </div>
                  <div v-if="storename"> 門市名稱: {{ storename }} </div>
                  <div v-if="storeaddress"> 門市地址: {{ storeaddress }} </div>
                </div>
                <div class="button2" v-if="!storeid || !storename || !storeaddress" @click="pickStore"> 搜尋門市 </div>
                <div class="button2" v-else @click="pickStore"> 更改門市 </div>
                <div class="prompt" v-if="is_click_finish_order && storeaddress == ''"> 請選擇門市 </div>
              </template>

              <!-- 發票 -->
              <template v-if="store.Receipt === '1'">
                <label>發票類型</label>
                <div class="custom_option2" :class="{active:personal_or_company === '個人發票'}" @click="personal_or_company = '個人發票'; invoice_type = is_other_invoice_type ? '0' : '1'">
                  個人發票
                </div>
                <div class="custom_option2" :class="{active:personal_or_company === '公司發票'}" @click="personal_or_company = '公司發票'; invoice_type = '2'"> 
                  公司發票
                </div>

                <template v-if="personal_or_company === '個人發票' && is_other_invoice_type">
                  <label>個人發票類型</label>

                  <div class="custom_option2" :class="{active:invoice_type === '1'}" @click="invoice_type = '1'"> 
                    個人紙本發票
                  </div>
                  <div class="custom_option2" v-if="store.NatureCode === '1'" :class="{active:invoice_type === '3'}" @click="invoice_type = '3'"> 
                    手機條碼載具
                  </div>
                  <div v-if="invoice_type === '3'">
                    <input type="text" placeholder="手機條碼載具" v-model="phone_barCode">
                    <div class="prompt" v-if="is_click_finish_order && phone_barCode === ''"> 請填寫手機條碼載具 </div>
                  </div>
                  <div class="custom_option2" v-if="store.NatureCode === '1'" :class="{active:invoice_type === '4'}" @click="invoice_type = '4'"> 
                    自然人憑證載具
                  </div>
                  <div v-if="invoice_type === '4'">
                    <input type="text" placeholder="自然人憑證載具" v-model="natural_barCode">
                    <div class="prompt" v-if="is_click_finish_order && natural_barCode === ''"> 請填寫自然人憑證載具 </div>
                  </div>
                </template>

                <div class="prompt" v-if="is_click_finish_order && invoice_type === '0'"> 請選擇發票類型 </div>

                <template v-if="invoice_type === '2'">
                  <div>
                    <input type="text" id="invoice_title" name="公司抬頭" placeholder="公司抬頭" v-model="invoice_title">
                    <div class="prompt" v-if="is_click_finish_order && invoice_title === ''"> 請填寫公司抬頭 </div>
                  </div>
                  <div>
                    <input type="text" id="invoice_uniNumber" name="統一編號" placeholder="統一編號" v-model="invoice_uniNumber">
                    <div class="prompt" v-if="is_click_finish_order && invoice_uniNumber === ''"> 請填寫統一編號 </div>
                  </div>
                </template>
              </template>
            </div>
          </form>

          <!--  有點數 或 有設定回饋% -->
          <template v-if="total_bonus * 1 || bonus_array.length">
            <div class="title">
              購物金 
              <span v-if="bonus_array.length">
                (<span v-if="!user_account" > 會員 </span>
                <span> 訂單完成後 </span>
                <template v-for="(item, index) in bonus_array" :key="index">
                  <template v-if="item.shipping">
                    <template v-if="item.lower == 0">
                      ，消費即送 {{ item.shipping }}% 購物金
                    </template>
                    <template v-else>
                      ，滿 NT${{ numberThousands(item.lower) }} 送 {{ item.shipping }}% 購物金 
                    </template>
                  </template>
                </template>)
              </span>
            </div>
            <div class="info" v-if="user_account">
              <div class="left">
                <div class="bonus_container">
                  購物金餘額: <span class="bonus"> {{numberThousands(total_bonus < 0 ? 0 : total_bonus)}} 點 </span>
                </div>
                <div class="box" v-if="total_bonus * 1">
                  <input type="checkbox" id="is_use_bonus" v-model="is_use_bonus" @change="use_bonus_handler"> 
                  <label for="is_use_bonus" > 使用購物金 </label>
                  <input type="number" placeholder="購物金" v-model="use_bonus" @blur="use_bonus_handler">
                </div>
              </div>
              <div class="right"></div>
            </div>
            <div class="info login" v-else>
              請先 <span class="a" @click="urlPush(getPathname('user'))"> 登入會員 </span>
            </div>
          </template>

          <div class="total">
            <ul>
              <li>
                <div class="before">商品金額</div>
                <div class="after">NT$ {{numberThousands(total.Total)}}</div>
              </li>
              <li>
                <div class="before">- 折扣</div>
                <div class="after">NT$ {{numberThousands(total.Discount)}}</div>
              </li>
              <li>
                <div class="before">- 折扣碼優惠</div>
                <div class="after">NT$ {{numberThousands(total.DiscountCode)}}</div>
              </li>
              <li>
                <div class="before">小計</div>

                <div class="after" v-if="(parseInt(total.Total) - parseInt(total.Discount) - parseInt(total.DiscountCode)) >= 0">
                  NT$ {{numberThousands(parseInt(total.Total) - parseInt(total.Discount) - parseInt(total.DiscountCode))}}
                </div>
                <div class="after" v-else>
                  NT$ 0
                </div>
              </li>
              <hr>
              <li v-if="is_use_bonus && use_bonus > 0">
                <div class="before">- 購物金</div>
                <div class="after">NT$ {{numberThousands(use_bonus)}}</div>
              </li>
              <li>
                <div class="before">+ 運費</div>
                <div class="after">NT$ {{numberThousands(total.Shipping)}}</div>
              </li>
              <li>
                <div class="before"> 金額總計 </div>
                <div class="after">NT$ {{numberThousands(total.Sum)}}</div>
              </li>
              <template v-if="user_account && total">
                <hr>
                <li>
                  訂單完成後獲得 NT${{ numberThousands(member_bonus) }} 購物金
                </li>
                <li>
                  (購物金將在出貨日滿14天後獲得)
                </li>
              </template>
            </ul>
          </div>
          
          <div class="buttonGroup">
            <div class="button" @click="stepIndex = 1; getProducts()">上一步</div>
            <div class="button" @click="checkOrder()"><i  v-show="orderIng" class="fas fa-spinner fa-spin" style="margin-right: 5px"></i>完成訂單</div>
          </div>
        </div>

        <div class="noItem" v-show="cartsLength === 0">
          <p> 購物車是空的?? </p>
          <p> 趕緊手刀買起來!! </p>
          <div class="button" @click="showPage='main'"> 現在就去逛! </div>
        </div>

        <div class="footer">
          <div class="top"></div>
          <div class="bottom">POWERED AND SECURED BY UNIQ Micronet</div>
        </div>
      </div>
    </div>
    <div class="ECPay_form_container" v-html="ECPay_form"></div>
    <div class="ECPay_form_container" v-html="ECPay_store_form"></div>

    <div class="selectProduct" v-if="showPage === 'selectProduct'" :style="`height:${innerHeight}px`">
      <div class="background">
        <div class="close" @click="selectProduct = {} ; showPage = 'main' ;"> <i class="fa fa-times" aria-hidden="true"></i> </div>
        <div class="picContent">
          <div class="pic">
            <div class="mainPic" :style="{backgroundImage :`url(${selectProduct.imgArr[selectProduct.mainImgIndex]})`}">
            </div>
            <div class="allPic">
              <div class="swiper-container">
                <div class="swiper-wrapper">
                  <div class="swiper-slide" v-for = "(item, index) in selectProduct.imgArr" :key="`${item}_${index}`"
                    :class="{active:selectProduct.mainImgIndex === index}"
                  >
                    <div class="border"></div>
                    <img :src="item" @click="selectProduct.mainImgIndex = index" alt="">
                  </div>
                </div>
              </div>
              <div class="controler" v-show="selectProduct.imgArr.length > 3">
                <div class="prev" @click="swiper.slidePrev()"> <i class="fa-solid fa-caret-left"></i> </div>
                <div class="next" @click="swiper.slideNext()"> <i class="fa-solid fa-caret-right"></i> </div>
              </div>
            </div>
          </div>
          <div class="content">
              <div class="title">{{selectProduct.Name}}</div>
              <!-- 多價格 selectProduct 主商品 info -->
              <template v-if="selectProduct.priceType === 'onePrice'">
                <div class="price" v-if="parseInt(selectProduct.Price) > -1" style="color:#9e9e9e; text-decoration: line-through; font-size:14px">NT$ {{ numberThousands(selectProduct.Price) }}</div>
                <div class="price">NT$ {{ numberThousands(selectProduct.NowPrice) }}</div>
              </template>
              <template v-else>
                <template v-if="selectProduct.selectSpecItem && selectProduct.selectSpecItem.ID">
                  <div class="price" v-if="parseInt(selectProduct.selectSpecItem.ItemPrice) > -1" style="color:#9e9e9e; text-decoration: line-through; font-size:14px">NT$ {{ numberThousands(selectProduct.selectSpecItem.ItemPrice) }}</div>
                  <div class="price">NT$ {{ numberThousands(selectProduct.selectSpecItem.ItemNowPrice) }}</div>
                </template>
                <template v-else>
                  <div class="price" v-if="selectProduct.priceRange" style="color:#9e9e9e; text-decoration: line-through; font-size:14px">NT$ {{ selectProduct.priceRange }}</div>
                  <div class="price">NT$ {{ selectProduct.nowPriceRange }}</div>
                </template>
              </template>
              
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
                  <div class="reduce" :class="{qtyDisabled:selectProduct.selectSpecItem.buyQty<1}" @click="getAmount( 3,  selectProduct.selectSpecItem.ID, updateProductsBuyQty_spec, [selectProduct, selectProduct.selectSpecItem.buyQty-1, selectProduct.selectSpecIndex,'']); "><i class="fa fa-minus"></i></div>
                  <input class="number" size="3" type="text" maxlength="3" @input="numberInput( selectProduct.selectSpecItem )"  @blur="getAmount( 3,  selectProduct.selectSpecItem.ID, updateProductsBuyQty_spec, [selectProduct, selectProduct.selectSpecItem.buyQty, selectProduct.selectSpecIndex,''])" 
                    @keyup.enter="getAmount( 3,  selectProduct.selectSpecItem.ID, updateProductsBuyQty_spec, [selectProduct, selectProduct.selectSpecItem.buyQty, selectProduct.selectSpecIndex,''])"
                    v-model="selectProduct.selectSpecItem.buyQty">
                  <div class="add" :class="{qtyDisabled:(selectProduct.selectSpecItem.Enable == 1 && selectProduct.selectSpecItem.buyQty > selectProduct.selectSpecItem.Amount - 1) || selectProduct.selectSpecItem.buyQty > 998 }" @click="getAmount( 3,  selectProduct.selectSpecItem.ID, updateProductsBuyQty_spec, [selectProduct, selectProduct.selectSpecItem.buyQty*1+1, selectProduct.selectSpecIndex,'']); "><i class="fa fa-plus"></i></div>
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
                  <div class="reduce" :class="{qtyDisabled:selectProduct.buyQty<1}" @click="getAmount( 1,  selectProduct.ID, updateProductsBuyQty, [selectProduct, selectProduct.buyQty-1,'']);  "><i class="fa fa-minus"></i></div>
                  <input class="number" size="3" type="text" maxlength="3" @input="numberInput_2"  @blur="getAmount( 1,  selectProduct.ID, updateProductsBuyQty, [selectProduct, selectProduct.buyQty,''])" 
                    @keyup.enter="getAmount( 1,  selectProduct.ID, updateProductsBuyQty, [selectProduct, selectProduct.buyQty,''])"
                    v-model="selectProduct.buyQty">
                  <div class="add" :class="{qtyDisabled:(selectProduct.Enable == 1 && selectProduct.buyQty > selectProduct.Amount - 1) || selectProduct.buyQty > 998 }" @click="getAmount( 1,  selectProduct.ID, updateProductsBuyQty, [selectProduct, selectProduct.buyQty*1+1,'']); "><i class="fa fa-plus"></i></div>
                </div>
                <div class="discontinued" v-show="store.Enable === '0'">停售中</div>
                <div class="discontinued" v-show="selectProduct.Enable == 1 && selectProduct.Amount == 0">暫無庫存</div>
              </template>

              <div class="goToCart" v-if="(selectProduct.specArr && selectProduct.selectSpecIndex != -1 && selectProduct.selectSpecItem.buyQty != 0 ) || (!selectProduct.specArr && selectProduct.buyQty != 0)" @click="getProducts(); showPage='cart'">
                加入購物車
                <i class="fa fa-shopping-cart" aria-hidden="true"></i>
              </div>

              <div class="addTo_favorite_btn" @click.stop="toggleFavorite(selectProduct.ID)">
                加入我的最愛 
                <i class="fas fa-heart" :class="{is_favorite : favorite[selectProduct.ID]}"></i>
              </div>

              <div class="share_link" @click="click_share_link">
                分享
                <i class="fas fa-share"></i>
              </div>

              <input type="text" id="copy_input2" readonly>
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
                <!-- 多價格 selectProduct 加價購 info -->
                <template v-if="item.PriceType === 'onePrice'">
                  <div class="price">NT$ {{ numberThousands(item.Price) }}</div>
                </template>
                <template v-else>
                  <template v-if="item.selectSpecItem && item.selectSpecItem.ID">
                    <div class="price">NT$ {{ numberThousands(item.selectSpecItem.ItemNowPrice) }}</div>
                  </template>
                  <template v-else>
                    <div class="price">NT$ {{ item.nowPriceRange }}</div>
                  </template>
                </template>
                
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

    <div class="favoriteIcon" v-show="showPage === 'main' && Object.keys(favorite).length" @click.stop="is_favorite_hover = !is_favorite_hover">
      <i class="fas fa-heart fa-2x"></i>
      <div class="num">
        {{Object.keys(favorite).length}}
      </div>
    </div>

    <div class="favorite_container" v-show="showPage === 'main' && Object.keys(favorite).length" :class="{hover : is_favorite_hover}">
      <ul class="favorite_items">
        <template v-for="item in favorite" :key="item.ID">
          <li @click.stop="showFavorite(item.ID)">
            <div class="img_and_name">
              <div class="img" :style="{backgroundImage: `url(${item.Img1})`}"></div>
              <div class="name"> {{ item.Name }} </div>
            </div>
            <div class="price_and_delete">
              <!-- 多價格 favorite 主商品 info -->
              <div class="price" v-if="item.priceType === 'onePrice'"> NT${{ item.NowPrice }} </div>
              <div class="price" v-else> NT${{ item.nowPriceRange }} </div>
              <div class="delete" @click.stop="toggleFavorite(item.ID)">
                <i class="fas fa-trash-alt"></i>
              </div>
            </div>
          </li>
        </template>
      </ul>
    </div>

    <div class="message_container">
      <div v-for="item in  messageArr" :key="item.id" 
          class="message" :class="{ messageActive:item.messageActive, messagefadeout:item.messagefadeout}" 
          :ref="`m${item.id}`" 
          :style="`background:${item.isSuccess ? 'rgba(50, 200, 50, 0.6)' : 'rgba(255, 0, 0, 0.6)'}`"> 
          {{ item.messageStr }}
      </div>
    </div>

    <!-- 前往付款頁面 -->
    <div class="confirm" v-if="isConfirm">
      <div class="frame">
        <div class="border"></div>
        <div class="confirm_title"> 
          <i class="fa fa-check-circle" aria-hidden="true"></i>  
          <div class="text"> 已收到您的訂單！ </div>
        </div>
        <div class="message"> 
          <template v-if="pay_method != 'PayOnDelivery' && pay_method != 'MartPayOnDelivery'">
            前往付款頁面
          </template>
        </div>
        <div class="buttonGroup">
          <div class="button determine" @click="isConfirm = false; toPay()"> 確定 </div>
        </div>
      </div>
    </div>

    <!-- 該mail已使用過折扣碼 -->
    <div class="confirm" v-if="isConfirm2">
      <div class="frame">
        <div class="border"></div>
        <div class="confirm_title"> 
          <i class="fa fa-question-circle" aria-hidden="true"></i>
        </div>
        <div class="message" v-if="!user_account"> 此折扣碼已使用過！請按取消重新輸入手機或折扣碼，或按確定放棄優惠直接完成訂單 </div>
        <div class="message" v-else> 您已使用過此折扣碼！請按取消後重新輸入折扣碼，或按確定放棄優惠直接完成訂單 </div>
        <div class="buttonGroup">
          <div class="button determine" @click="cancelDiscountCodeCreateOrder()"> 確定  </div>
          <div class="button cancel" @click=" isConfirm2 = false;"> 取消 </div>
        </div>
      </div>
    </div>

    <!-- ATM 匯款訊息 -->
    <div class="confirm" v-if="isConfirm3">
      <div class="frame">
        <div class="border"></div>
        <div class="confirm_title"> 
          <i class="fa fa-check-circle" aria-hidden="true"></i>
          <div class="text"> 已收到您的訂單！ </div>  
        </div>
        <div class="message bank"> 
          <div style="display: flex; flex-wrap: wrap;">
            <div style="margin-right: 5px; margin-bottom: 10px;"> 匯款銀行 : </div>
            <div style="margin-bottom: 10px;"> {{store.SelfAtmBankId}} {{bank[store.SelfAtmBankId]}}  </div>
          </div>
          <div class="bank_account">
            <div class="bank_title"> 匯款帳號 : </div>
            <input type="text" id="copy_input" readonly v-model="store.SelfAtmId">
            <div class="copy" @click="copy(store.SelfAtmId, '#copy_input')"> <i class="fas fa-copy"></i> </div>
          </div>
        </div>
        <div class="tip">
          <i class="fas fa-exclamation-circle"></i>
          請記得在匯款成功後前往 <div class="a" @click="urlPush(`${getPathname('order')}?phone=${info.purchaser_number}&email=${info.purchaser_email}`, true)"> 訂單列表 </div>
          輸入匯款帳戶末6碼，我們確認後將儘快為您安排出貨！。
        </div>

        <div class="buttonGroup">
          <div class="button determine" @click="isConfirm3 = false"> 確定 </div>
        </div>
      </div>
    </div>

    <!-- 詢問是否註冊會員 -->
    <div class="confirm" v-if="isConfirm4">
      <div class="frame">
        <div class="border"></div>
        <div class="confirm_title"> 
          <i class="fa fa-check-circle" aria-hidden="true"></i>
          <div class="text"> 已收到您的訂單！ </div>
        </div>
        <div class="message"> 
          是否可以耽擱您一點時間來加入我們會員？
        </div>
        <div class="buttonGroup">
          <div class="button cancel" @click="isConfirm4 = false; toPay()"> 
            否
            <template v-if="pay_method != 'PayOnDelivery' && pay_method != 'MartPayOnDelivery'">
              ，前往付款頁面 
            </template>
          </div>
          <div class="button determine" @click="isConfirm4 = false; auto_info();isConfirm5 = true"> 是，請填寫註冊資料 </div>
        </div>
      </div>
    </div>

    <!-- 註冊表單 -->
    <div class="confirm" v-if="isConfirm5">
      <div class="frame">
        <div class="border"></div>
        <div class="confirm_title"> 
          <i class="fas fa-registered"></i>
          <div class="text"> 加入會員！ </div>
        </div>
        <div class="form">
          <div class="input_container" :class="{ error: r_name.is_error }">
            <input type="text" readonly v-model.trim="r_name.value">
          </div>

          <div class="input_container">
            <input type="number" readonly v-model.trim="r_account.value">
          </div>
          <template v-if="store.NotificationSystem == 1 || store.NotificationSystem == 2">
            <div class="input_container" :class="{ error: r_verify_code.is_error }">
              <input type="text" placeholder="* 請輸入手機驗證碼" v-model.trim="r_verify_code.value" @blur="verify(r_verify_code)"> 
              <div class="error message">
                <i class="error_icon fas fa-exclamation-circle"></i> {{  r_verify_code.message  }}
              </div>
            </div>
          </template>

          <div class="input_container" :class="{ error: r_mail.is_error }">
            <input type="text" readonly placeholder="* 請輸入電子信箱" v-model.trim="r_mail.value" @blur="verify(r_mail)">
            <div class="error message">
              <i class="error_icon fas fa-exclamation-circle"></i> {{  r_mail.message  }}
            </div>
          </div>
          <template v-if="store.NotificationSystem == 0 || store.NotificationSystem == 2">
            <div class="input_container" :class="{ error: r_verify_code2.is_error }">
              <input type="text" placeholder="* 請輸入電子信箱驗證碼" v-model.trim="r_verify_code2.value" @blur="verify(r_verify_code2)"> 
              <div class="error message">
                <i class="error_icon fas fa-exclamation-circle"></i> {{  r_verify_code2.message  }}
              </div>
            </div>
          </template>

          <div class="button" style="margin-bottom: 20px;" @click="send_verify_code"> 獲取驗證碼 <span v-if="second > 0"> ( {{second}}s ) </span> </div>

          <div class="input_container" :class="{ error: r_birthday.is_error }">
            <date-picker placeholder="* 請輸入生日" format="YYYY/MM/DD" v-model="r_birthday.value" @close="verify(r_birthday)"
              @clear="verify(r_birthday)"></date-picker>
            <div class="error message">
              <i class="error_icon fas fa-exclamation-circle"></i> {{  r_birthday.message  }}
            </div>
          </div>
          <div class="radio_container">
            <div class="radio">
              <input type="radio" name="sex" id="male" value="male" v-model="sex">
              <div class="circle" v-show="sex == 'male'"> </div>
            </div>
            <label for="male"> 男 </label>
            <div class="radio">
              <input type="radio" name="sex" id="female" value="female" v-model="sex">
              <div class="circle" v-show="sex == 'female'"> </div>
            </div>
            <label for="female"> 女 </label>
          </div>
          <div class="input_container" :class="{ error: r_password.is_error }">
            <input :type="r_password_type" placeholder="* 請輸入密碼" v-model.trim="r_password.value"
              @blur="verify(r_password)" autocomplete="false">
            <div class="eyes_icon"
              @click.stop="r_password_type == 'password' ? r_password_type = 'text' : r_password_type = 'password'">
              <i class="fas fa-eye" v-if="r_password_type == 'text'"></i>
              <i class="fas fa-eye-slash" v-else></i>
            </div>
            <div class="error message">
              <i class="error_icon fas fa-exclamation-circle"></i> {{  r_password.message  }}
            </div>
          </div>
          <div class="input_container" :class="{ error: r_confirm_password.is_error }">
            <input :type="r_confirm_password_type" placeholder="* 請再次輸入密碼" v-model.trim="r_confirm_password.value"
              @blur="verify(r_confirm_password)" autocomplete="false">
            <div class="eyes_icon"
              @click.stop="r_confirm_password_type == 'password' ? r_confirm_password_type = 'text' : r_confirm_password_type = 'password'">
              <i class="fas fa-eye" v-if="r_confirm_password_type == 'text'"></i>
              <i class="fas fa-eye-slash" v-else></i>
            </div>
            <div class="error message">
              <i class="error_icon fas fa-exclamation-circle"></i> {{  r_confirm_password.message  }}
            </div>
          </div>

          <div class="agree_container">
            <div class="checkbox">
              <input type="checkbox" name="" id="agree" v-model="r_is_agree">
              <i class="fas fa-check" v-show="r_is_agree"></i>
            </div>
            <label for="agree"> 我已同意 </label>
            <div class="modal_text" @click="is_userModal = true"> 會員條款與隱私權政策 </div>
          </div>
        </div>
        <div class="buttonGroup">
          <div class="button cancel" @click="isConfirm5 = false; toPay()"> 
            <template v-if="pay_method != 'PayOnDelivery' && pay_method != 'MartPayOnDelivery'">
              前往付款頁面 
            </template>
            <template v-else>
              取消
            </template>
          </div>
          <div class="button determine" :class="{ disabled: !r_is_agree }" @click="register"> 註冊 </div>
        </div>
      </div>
    </div>

    <div class="main" v-if="showPage === 'main'">
      <div class="logo_name">
        <img :src="store.Logo" class="logo" v-if="store.Logo" @click="urlPush(getPathname('index'))">
      </div>
      <div class="menu" v-if="webVersion != 'uniqm.net'">
        <ul>
          <li @click="urlPush(getPathname('index'))">
            <i class="fa-solid fa-house"></i> 
            <span> 首頁 </span>
          </li>
          <li @click="urlPush(getPathname('order'))">
            <i class="fas fa-clipboard-list"></i>
            <span class="none650"> 訂單 </span>
          </li>
          <li v-if="site.MemberFuction * 1" @click="user_account ? urlPush(getPathname('info')) : urlPush(getPathname('user'))">
            <i class="fa-solid fa-user"></i> 
            <span class="none650"> 會員中心 </span>
          </li>
        </ul>
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
      </div>

      <div class="products" :class="{change:arrangement==1}">
        <ul>
          <li v-for="(item, index) in pageFilterProduct" :key="item.ID" >
            <div class="pic_div">
              <div class="pic" :style="{backgroundImage :`url(${item.Img1})`, height:`${picHeight}px`}" @click="showSelect(item, index)">
                <div class="detailButton">
                  查看詳情
                  <i class="fas fa-heart" :class="{is_favorite : favorite[item.ID]}" @click.stop="toggleFavorite(item.ID)"></i>
                </div>
              </div>
            </div>

            <div class="content">
              <div class="title">{{item.Name}}</div>
              <!-- 多價格 products 主商品 info -->
              <template v-if="item.priceType === 'onePrice'">
                <div class="price" v-if="parseInt(item.Price) > -1" style="color:#9e9e9e; text-decoration: line-through; font-size:14px">NT$ {{ numberThousands(item.Price) }}</div>
                <div class="price" v-else style="opacity: 0">NT$ {{ numberThousands(item.Price) }}</div>
                <div class="price">NT$ {{ numberThousands(item.NowPrice) }}</div>
              </template>
              <template v-else>
                <template v-if="item.selectSpecItem && item.selectSpecItem.ID">
                  <div class="price" v-if="parseInt(item.selectSpecItem.ItemPrice) > -1" style="color:#9e9e9e; text-decoration: line-through; font-size:14px">NT$ {{ numberThousands(item.selectSpecItem.ItemPrice) }}</div>
                  <div class="price" v-else style="opacity: 0">NT$ {{ numberThousands(item.selectSpecItem.ItemPrice) }}</div>
                  <div class="price">NT$ {{ numberThousands(item.selectSpecItem.ItemNowPrice) }}</div>
                </template>
                <template v-else>
                  <div class="price" v-if="item.priceRange" style="color:#9e9e9e; text-decoration: line-through; font-size:14px">NT$ {{ item.priceRange }}</div>
                  <div class="price" v-else style="opacity: 0">NT$ {{ item.priceRange }}</div>
                  <div class="price">NT$ {{ item.nowPriceRange }}</div>
                </template>
              </template>

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
                  <div class="reduce" :class="{qtyDisabled:item.selectSpecItem.buyQty<1}" @click="getAmount( 3,  item.selectSpecItem.ID, updateProductsBuyQty_spec, [item, item.selectSpecItem.buyQty-1, item.selectSpecIndex, $event]);"><i class="fa fa-minus"></i></div>
                  <input class="number" size="3" @blur="getAmount( 3,  item.selectSpecItem.ID, updateProductsBuyQty_spec, [item, item.selectSpecItem.buyQty, item.selectSpecIndex, ''])" 
                    @keyup.enter="getAmount( 3,  item.selectSpecItem.ID, updateProductsBuyQty_spec, [item, item.selectSpecItem.buyQty, item.selectSpecIndex, ''])"
                    type="text" maxlength="3" @input="numberInput(item.selectSpecItem)"  v-model="item.selectSpecItem.buyQty">
                  <div class="add" :class="{qtyDisabled:(item.selectSpecItem.Enable == 1 && item.selectSpecItem.buyQty > item.selectSpecItem.Amount - 1) || item.selectSpecItem.buyQty > 998 }" @click="getAmount( 3,  item.selectSpecItem.ID, updateProductsBuyQty_spec, [item, item.selectSpecItem.buyQty+1, item.selectSpecIndex, $event]);"><i class="fa fa-plus"></i></div>
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
                  <div class="reduce" :class="{qtyDisabled:item.buyQty<1}" @click="getAmount( 1,  item.ID, updateProductsBuyQty, [item, item.buyQty-1, $event]); "><i class="fa fa-minus"></i></div>
                  <input class="number" size="3" @blur="getAmount( 1,  item.ID, updateProductsBuyQty, [item, item.buyQty, ''])" 
                    @keyup.enter="getAmount( 1,  item.ID, updateProductsBuyQty, [item, item.buyQty, ''])"
                    type="text" maxlength="3" @input="numberInput_2"  v-model="item.buyQty">
                  <div class="add" :class="{qtyDisabled:(item.Enable == 1 && item.buyQty > item.Amount - 1) || item.buyQty > 998 }" @click="getAmount( 1,  item.ID, updateProductsBuyQty, [item, item.buyQty*1+1, $event]); "><i class="fa fa-plus"></i></div>
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

    <div class="user_modal_container" v-if="is_userModal">
      <div class="close" @click="is_userModal = false;">
        <i class="fas fa-times"></i>
      </div>
      <div class="user_modal">
        <div class="content" v-html="unescapeHTML(site.TermsNotices)"></div>
      </div>
    </div>

    <Cookie />
  </div>
</template>

<script>
import Cookie from './Cookie.vue'
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';

import Swiper from 'swiper';
import 'swiper/swiper.scss'

export default {
  components: {
    DatePicker,
    Cookie
  },
  data() {
    return {
      site: {},
      store: {},
      categories: [],
      products: [],

      //
      user_account: '',
      isSyncCarts: false,
      userInfo: {},

      productCompleted: false,

      carts: [],

      favorite: {},
      is_favorite_hover: false,

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
      transport: '0', // 一般宅配1 到店自取2
      transport_obj: {
        0: '',
        1: '一般宅配',
        2: '到店自取',
        'UNIMARTDelivery': '7-11 取貨付款',
        'UNIMARTC2CDelivery': '7-11 取貨付款',
        'UNIMART': '7-11 取貨不付款',
        'UNIMARTC2C': '7-11 取貨不付款',
        'UNIMARTFREEZEDelivery': '7-11冷凍 取貨付款',
        'UNIMARTFREEZE': '7-11冷凍 取貨不付款',

        'FAMIDelivery': '全家 取貨付款',
        'FAMIC2CDelivery': '全家 取貨付款',
        'FAMI': '全家 取貨不付款',
        'FAMIC2C': '全家 取貨不付款',

        'HILIFEDelivery': '萊爾富 取貨付款',
        'HILIFEC2CDelivery': '萊爾富 取貨付款',
        'HILIFE': '萊爾富 取貨不付款',
        'HILIFEC2C': '萊爾富 取貨不付款',

        'OKMARTC2CDelivery': 'OK超商 取貨付款',
        'OKMARTC2C': 'OK超商 取貨不付款',
      },
      is_show_transport_options: false,
      pay_method: '0',
      pay_method_obj: {
        'CreditCard': '信用卡',
        'ATM': 'ATM/網路ATM',
        'PayCode': '超商代碼',
        'PayBarCode': '超商條碼',
        'PayOnDelivery': '取貨付款',
        'LinePay': 'LINE Pay',
        'MartPayOnDelivery': '超商取貨付款'
      },
      is_show_pay_method_options: false,
      is_click_finish_order: false,
      info: {
        purchaser_email:'',
        purchaser_email_error: '',
        purchaser_name:'',
        purchaser_name_error: '',
        purchaser_number:'',
        purchaser_number_error: '',
        receiver_name:'',
        receiver_name_error: '',
        receiver_number:'',
        receiver_number_error: '',
        info_message:''
      },

      personal_or_company: '',
      is_show_personal_or_company_options: false,
      invoice_type: '0',
      phone_barCode: '',
      natural_barCode: '',
      invoice_title: '',
      invoice_uniNumber: '',
      orderIng: false,

      storeid: '',
      storename: '',
      storeaddress: '',

      isConfirm: false,
      isConfirm2: false,
      isConfirm3: false,
      isConfirm4: false,
      isConfirm5: false,

      is_userModal: false,

      payResult: {},

      // register
      r_name: {
        value: '',
        rules: {
          required: {
            message: '此項目為必填'
          },
          name: {
            message: '請輸入全中文或全英文'
          },
          nameLength: {
            message: '中文長度請介於2~5，英文長度請介於4~10'
          },
        },
        is_error: false,
        message: '',
      },
      r_mail: {
        value: '',
        rules: {
          required: {
            message: '此項目為必填'
          },
          mail: {
            message: 'email格式不符',
          }
        },
        is_error: false,
        message: '',
      },
      r_birthday: {
        value: '',
        rules: {
          required: {
            message: '此項目為必填'
          },
        },
        is_error: false,
        message: '',
      },
      sex: 'male',
      r_account: {
        value: '',
        rules: {
          required: {
            message: '此項目為必填'
          },
          cellphone: {
            message: '手機格式錯誤'
          }
        },
        is_error: false,
        message: '',
      },
      r_verify_code: {
        value: '',
        rules: {
          required: {
            message: '此項目為必填'
          },
          length: {
            min: 6,
            max: 6,
            message: '驗證碼為6位',
          }
        },
        is_error: false,
        message: '',
      },
      r_verify_code2: {
        value: '',
        rules: {
          required: {
            message: '此項目為必填'
          },
          length: {
            min: 6,
            max: 6,
            message: '驗證碼為6位',
          }
        },
        is_error: false,
        message: '',
      },
      second: 0,
      r_password: {
        value: '',
        rules: {
          required: {
            message: '此項目為必填'
          },
          length: {
            min: 8,
            message: '不得少於8位',
          }
        },
        is_error: false,
        message: '',
      },
      r_confirm_password: {
        value: '',
        rules: {
          required: {
            message: '此項目為必填'
          },
          confirm: {
            password: 'r_password',
            message: '密碼不正確',
          }
        },
        is_error: false,
        message: '',
      },
      r_password_type: 'password',
      r_confirm_password_type: 'password',
      r_is_agree: false,

      //
      bank: '',
      // bank: require('../assets/bank.json'),

      ECPay_form: '',
      ECPay_store_form: '',
      
      innerHeight: 0,
      picHeight: 0,

      //
      total_bonus: 0,
      bonus_percent: 0,
      bonus_array: [],
      use_bonus: 0,
      is_use_bonus: false,

      //
      city_district: '',
      city_active: '',
      is_show_city_options: false,
      district_active: '',
      is_show_district_options: false,
      detail_address: '',
      is_save_address: false,
      has_address: false,

      //
      isAddPrice: false,
      isDetail: false,

      //
      swiper: null,

      api: '',
      protocol: '',

      //
      webVersion: 'common',
    }
  },
  watch:{
    // this.info
    isSame(v) {
      if(v){
        this.info.receiver_name = this.info.purchaser_name;
        this.info.receiver_number = this.info.purchaser_number;
      } else {
        this.info.receiver_name = ''
        this.info.receiver_number = '';
      }
      this.validate('receiver_name', 'required', 'name', 'nameLength')
      this.validate('receiver_number', 'required')
    },
    //
    transport(newV, oldV) {
      this.getTotal(1);
      if(newV.indexOf('Delivery') > -1) this.pay_method = 'MartPayOnDelivery' 

      if(this.productCompleted) {
        this.storeid = ''
        this.storename = ''
        this.storeaddress = ''
      }
    },
    // selectProduct
    showPage(newV, oldV) {
      let vm = this

      // selectProduct => ?
      if(oldV === 'selectProduct' && newV != oldV) {
        window.history.replaceState({}, document.title, location.pathname);
      }
      
      if( newV === 'selectProduct' || newV === 'singleProduct') {
        setTimeout(() => {
          const resizeObserver = new ResizeObserver(() => {
            vm.swiper = null;
            vm.initSwiper();
          });
          resizeObserver.observe(document.querySelector(".mainPic"));
          
          vm.initSwiper();
          vm.computedVideoWidth(newV);
        }, 0)
      }
      if( newV === 'Content' || newV === 'Description' || newV === 'PrivacyPolicy' ){
        setTimeout(() => {
          vm.computedVideoWidth(newV);
        }, 0)
      }
    },
    //
    city_active(newV) {
      for(let key in this.city_district[newV]) {
        if(key == this.district_active) return
      }
      this.district_active = ''
    }
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

    member_bonus() {
      return Math.floor((this.total.Sum - this.total.Shipping) * (this.bonus_percent / 100))
    },

    receiver_address() {
      let address = `${this.city_active} ${this.district_active} ${this.detail_address}`
      if(this.userInfo.address_obj){
        this.has_address = false;
        for(let key in this.userInfo.address_obj) {
          let item = this.userInfo.address_obj[key];
          if(item.address == address){
            this.has_address = true;
          }
        }
      }
      return address;
    },

    transport_number() {
      let number = 0;
      if(this.store.Shipping === '1') number += 2
      if(this.store.Shipping === '2') number += 1
      if(this.store.Shipping === '3') number += 1

      if(this.store.UNIMARTDelivery || this.store.UNIMARTC2CDelivery) number += 1
      if(this.store.UNIMART|| this.store.UNIMARTC2C) number += 1
      if(this.store.UNIMARTFREEZEDelivery) number += 1
      if(this.store.UNIMARTFREEZE) number += 1

      if(this.store.HILIFEDelivery || this.store.HILIFEC2CDelivery) number += 1
      if(this.store.HILIFE|| this.store.HILIFEC2C) number += 1

      if(this.store.OKMARTC2C) number += 1
      if(this.store.OKMARTC2CCDelivery) number += 1

      return number
    },

    is_store() {
      if(this.transport == 0) return undefined
      else if(this.transport === '1' || this.transport === '2') return false
      else return true
    },
    is_collection() {
      if(this.transport == 0) return undefined
      else if( this.transport.indexOf('Delivery') > -1) return true
      else return false
    },

    is_other_invoice_type() {
      if(this.store.PhoneCode === '1' || this.store.NatureCode === '1') return true
      return false
    }
  },
  methods: {
    login(func, arr) {
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
    getSite() {
      const vm = this;

      const url = `${vm.protocol}//${vm.api}/interface/store/GetSite`;
      this.$http.get(url).then((res) => {
        if(res.data.errormessage){
          vm.login(vm.getSite);
          return;
        }

        vm.site = res.data.data[0];
        if(!vm.site){
          return
        }

        localStorage.setItem('site', JSON.stringify(vm.site));

        // Line 登入
        let account = location.search.split('account=')[1] && 
        location.search.split('account=')[1].split('&')[0];
        if(account) {
          vm.user_account = account
          localStorage.setItem('user_account', vm.user_account)
        }

        // Line 綁定
        let result = location.search.split('result=')[1] && 
        location.search.split('result=')[1].split('&')[0];
        if(result) {
          result = JSON.parse(decodeURI(result))
          if(!result.status) alert(result.msg)
          else {
            vm.user_account = result.account
            localStorage.setItem('user_account', vm.user_account)
          }

          window.history.replaceState({}, document.title, location.pathname);
        }
        
        vm.user_account = localStorage.getItem('user_account');
        
        if(vm.site.FeedbackFund) {
          vm.bonus_array = JSON.parse(vm.site.FeedbackFund);
        }

        vm.getStore();
        vm.getStore2();
        vm.getCategories();
        vm.getProducts();

        if(vm.user_account) vm.getUserInfo();
      })
      .catch((err) => {
        console.error(err);
        vm.login(vm.getSite);
      });
    },

    getStore() {
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
        let store = res.data.data[0]
        store.paymethodOrder = {}
        if(store.OrderPaymethod) {
          store.OrderPaymethod = JSON.parse(store.OrderPaymethod)
          store.OrderPaymethod.forEach(item => {
            store.paymethodOrder[item.name] = parseInt(item.order)
          })
        }
        let CVSSetting = JSON.parse(store.CVSSetting)

        if(store.ECStatus == 0) {
          for(let key in CVSSetting) {
            if(key.indexOf('Shipping') > -1) {
              CVSSetting[key] = false
            }
          }
        }
        for(let key in CVSSetting) {
          if(key.indexOf('Shipping') > -1) continue
          let mart = key.replace('C2CC', '').replace('C2C', '').replace('FREEZE', '').replace('Delivery', '')
          if(!CVSSetting[`${mart}Shipping`]) CVSSetting[key] = false
          store[key] = CVSSetting[key]
        }
        console.log(store)

        /*
          FAMI
          FAMIC2C
          FAMIC2CDelivery
          FAMIDelivery
          FAMIShipping

          HILIFE
          HILIFEC2C
          HILIFEC2CDelivery
          HILIFEDelivery
          HILIFEShipping
          
          OKMARTC2C
          OKMARTC2CDelivery
          OKMARTShipping
          
          UNIMART
          UNIMARTC2C
          UNIMARTC2CDelivery
          UNIMARTDelivery
          UNIMARTFREEZE
          UNIMARTFREEZEDelivery
          UNIMARTShipping
        */

        vm.store = store;
        vm.arrangement = vm.store.Sort || "0";
        document.title = vm.store.Name;
      })
      .catch((err) => { 
        console.error(err);
        vm.login(vm.getStore);
      });
    },
    appendScript(text, tag){
      if(!text){
        return
      }

      // 
      let script_arr = [];

      let scriptItems = text.split('&lt;script');
      scriptItems.splice(0, 1);

      for(let i = 0; i < scriptItems.length; i++){
        scriptItems[i] = '&lt;script '+ scriptItems[i].trim();
        let attr = scriptItems[i].split('&gt;')[0];

        let content = scriptItems[i].split('&gt;')[1].split("&lt;/script")[0];
        let arr = attr.split(" ");
        let obj = {};
        for(let i = 0; i < arr.length; i++){
          if(arr[i].indexOf('="') != -1){
            obj[arr[i].split('="')[0]] = arr[i].split('="')[1].split('"')[0];
          } 
        }

        let script = document.createElement('script');
        for(let item in obj){
          script.setAttribute(item, obj[item]);
        }
        script.textContent = content;

        script_arr.push(script);
      }

      // 
      for(let i = 0; i < script_arr.length; i++){
        document.querySelector(tag).appendChild(script_arr[i])
      }
    },
    getStore2(){
      const vm = this;

      const url = `${vm.protocol}//${vm.api}/interface/web/getStore`;

      let site_webPreview = (JSON.parse(localStorage.getItem('site')).WebPreview || '') ;

      let formData = new FormData();
      formData.append("WebPreview", site_webPreview);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      this.$http.post(url, formData, config).then((res) => {
        if(res.data.errormessage){
          vm.login(vm.getStore2);
          return;
        }

        let store2 = res.data.data[0]
        let GAText = store2.GA;

        if(GAText.indexOf('GTM-') > -1) {
          let GTMID = GAText.split('GTM-')[1].split('\')')[0]

          let noscript = document.createElement('noscript');
          noscript.setAttribute('src', `https://www.googletagmanager.com/ns.html?id=GTM-${GTMID}`);
          noscript.setAttribute('height', '0');
          noscript.setAttribute('width', '0');
          noscript.setAttribute('style', 'display:none; visibility:hidden');

          document.querySelector('body').insertBefore(noscript, document.querySelector('#app'));
        }

        vm.appendScript(GAText, 'head');
      })
      .catch((err) => { 
        console.error(err);
        vm.login(vm.getStore2);
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
    getProducts(type) {
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

          let lowestPrice = 0
          let highestPrice = 0
          let lowestNowPrice = 0
          let highestNowPrice = 0

          for(let k = 0; k < data2.length; k++) {
            if(data2[k].ProductID == p.ID){
              f = true;

              if(!p.selectSpecIndex){
                vm.$set(p, 'selectSpecIndex', '-1');
                vm.$set(p, 'selectSpecItem', {});
                vm.$set(p, 'specArr', []);
              }

              vm.$set(data2[k], 'buyQty', 0);
              p.specArr.push(data2[k]);

              if(p.priceType === 'multiPrice') {
                let { ItemPrice, ItemNowPrice } = data2[k]
                if(!highestPrice) {
                  highestPrice = ItemPrice
                  lowestPrice = ItemPrice
                  highestNowPrice = ItemNowPrice
                  lowestNowPrice = ItemNowPrice
                } else {
                  if(ItemPrice > highestPrice) highestPrice = ItemPrice
                  if(ItemPrice < lowestPrice) lowestPrice = ItemPrice
                  if(ItemNowPrice > highestNowPrice) highestNowPrice = ItemNowPrice
                  if(ItemNowPrice < lowestNowPrice) lowestNowPrice = ItemNowPrice

                  if(lowestPrice < 0) lowestPrice = 0
                  if(lowestNowPrice < 0) lowestNowPrice = 0
                }
              }
            }
          }
          if(!f) {
            p.buyQty = 0;
          }

          if(p.priceType === 'multiPrice') {
            if(lowestPrice === highestPrice) p.priceRange = vm.numberThousands(lowestPrice)
            else p.priceRange = `${vm.numberThousands(lowestPrice)} - ${vm.numberThousands(highestPrice)}`

            if(lowestNowPrice === highestNowPrice) p.nowPriceRange = vm.numberThousands(lowestNowPrice)
            else p.nowPriceRange = `${vm.numberThousands(lowestNowPrice)} - ${vm.numberThousands(highestNowPrice)}`
          }

          vm.$set(p, 'mainImgIndex', 0);
          let imgArr = [p.Img1, p.Img2, p.Img3, p.Img4, p.Img5].filter(img => img);
          vm.$set(p, 'imgArr', imgArr);
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

        let searchArr = location.search.substring(1).split('&')
        let searchObj = {}
        searchArr.forEach(item => {
          let key = item.split('=')[0];
          let value = item.split('=')[1]
          if(key && value) searchObj[key] = value
        })

        // RtnMsg
        let RtnMsg = searchObj['RtnMsg']
        if(RtnMsg && RtnMsg == 'Succeeded') {
          window.history.replaceState({}, document.title, location.pathname);
          if(vm.user_account) {
            localStorage.removeItem(`${vm.site.Name}@${vm.user_account}@carts`);
          }
          else {
            localStorage.removeItem(`${vm.site.Name}@carts`);
          }
          vm.showMessage('已收到您的付款！', true)
        }

        // 超商取貨付款
        let storeid = searchObj['CVSStoreID']
        let storename = searchObj['CVSStoreName']
        let storeaddress = searchObj['CVSAddress']

        // spid
        let spid = searchObj['spid'];
        if(spid) {
          for(let i = 0; i < vm.products.length; i++) {
            if(vm.products[i].ID == spid) {
              vm.selectProduct = vm.products[i]; 
              vm.selectIndex = i;
              vm.showPage = 'singleProduct';

              // 7-11 取貨付款
              vm.getConvenienceStore(storeid, storename, storeaddress, spid)
              
              vm.getCarts(type, '1');

              vm.productCompleted = true;

              return
            }
          }
        }

        vm.getFavorite();
        vm.category = '0';
        vm.getCarts(type, '1');

        // id
        let id = searchObj['id'];
        if(id) {
          for(let i = 0; i < vm.products.length; i++) {
            if(vm.products[i].ID == id) {
              vm.showSelect( vm.products[i], i);
            }
          }
        }

        // open_carts
        let is_open_carts = searchObj['open_carts']
        if(is_open_carts){
          window.history.replaceState({}, document.title, location.pathname);
          vm.showPage = 'cart'
        }

        // 超商取貨付款
        vm.getConvenienceStore(storeid, storename, storeaddress)

        vm.$nextTick(() => {
          vm.productCompleted = true;
        })
      })
      .catch((err) => {
        console.error(err);
        vm.login(vm.getProducts, [type]);
      });
    },
    // 超商取貨付款
    getConvenienceStore(storeid, storename, storeaddress, spid) {
      let vm = this
      if(!storeid || !storename || !storeaddress) return
      vm.storeid = storeid
      vm.storename = decodeURI(storename)
      vm.storeaddress = decodeURI(storeaddress)

      if(spid) {
        window.history.replaceState({}, document.title, `${location.pathname}?spid=${spid}`);
        vm.stepIndex = 2
      }
      else {
        window.history.replaceState({}, document.title, location.pathname);
        vm.showPage = 'cart'
        vm.stepIndex = 2
      }

      vm.returnInfo()
    },
    getUserInfo() {
      let vm = this;

      return new Promise((resolve, reject) => {
        const url = `${vm.protocol}//${vm.api}/interface/WebMember/GetMemberInfo`;
        let formData = new FormData();
        formData.append("storeid", vm.site.Name);
        formData.append("phone", vm.user_account);
        const config = {
          headers: {
            // 'Content-Type': 'application/x-www-form-urlencoded'
            'Content-Type': 'multipart/form-data'
          }
        };
        vm.$http.post(url, formData, config).then((res) => {
          if(res.data.status){
            vm.userInfo = res.data.datas[0][0]

            vm.info.purchaser_email = vm.userInfo.Email;
            vm.info.purchaser_name = vm.userInfo.Name;
            vm.info.purchaser_number = vm.userInfo.Phone2;
            vm.total_bonus = vm.userInfo.Wallet * 1
            vm.userInfo.Adress = decodeURI(vm.userInfo.Adress)
            let address_obj = {};
            let address_arr = vm.userInfo.Adress.split('_#_');
            address_arr.length = address_arr.length - 1;
            for(let address of address_arr){
              let item = address.split('_ _');
              address_obj[item[0]] = {
                id: item[0],
                address: `${item[1]} ${item[2]} ${item[3]}`,
              }
            }
            vm.userInfo.address_obj = address_obj;
            vm.phone_barCode   = vm.userInfo.PhoneCode;
            vm.natural_barCode  = vm.userInfo.NatureCode;
            if(vm.userInfo.ThreeLinkCode) {
              let invoice_arr = vm.userInfo.ThreeLinkCode.split('|')
              if(!vm.invoice_title) vm.invoice_title = invoice_arr[0] || ''
              if(!vm.invoice_uniNumber) vm.invoice_uniNumber = invoice_arr[1] || ''
            }
          }
          else {
            if( res.data.msg == '請先登入會員' ||
                res.data.msg == '閒置逾時，請重新登入' ||
                res.data.msg == '已登出，請重新登入'
            ) {
              localStorage.removeItem('user_account');
              vm.user_account = '';
            }
          }

          resolve()
        })
        .catch((err) => { 
          console.error(err);
          resolve()
        });
      })
    },
    
    getAddPrice(id, item, type2) {
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

          let lowestNowPrice = 0
          let highestNowPrice = 0

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

              if(p.PriceType === 'multiPrice') {
                let { ItemNowPrice } = data2[k]
                if(!lowestNowPrice) {
                  lowestNowPrice = ItemNowPrice
                  highestNowPrice = ItemNowPrice
                } else {
                  if(ItemNowPrice > lowestNowPrice) lowestNowPrice = ItemNowPrice
                  if(ItemNowPrice < highestNowPrice) highestNowPrice = ItemNowPrice

                  if(highestNowPrice < 0) highestNowPrice = 0
                }
              }
            }
          }
          if( !p.specArr ){
            p.Qty = 0;
          }

          if(p.PriceType === 'multiPrice') {
            if(highestNowPrice === lowestNowPrice) p.nowPriceRange = vm.numberThousands(highestNowPrice)
            else p.nowPriceRange = `${vm.numberThousands(highestNowPrice)} - ${vm.numberThousands(lowestNowPrice)}`
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
    
    getCarts(type, type2) { // type '0' '1'getTotal type2 '0' '1'
      if(this.showPage === 'singleProduct') {
        this.carts = JSON.parse(localStorage.getItem(`${this.site.Name}@${this.selectProduct.ID}@carts`)) || [];
      }
      else {
        if(this.user_account) {
          this.carts = JSON.parse(localStorage.getItem(`${this.site.Name}@${this.user_account}@carts`)) || [];
        }
        else {
          this.carts = JSON.parse(localStorage.getItem(`${this.site.Name}@carts`)) || [];
        }
      }

      let isGetTotal = 0;
      this.computedCartsLength();
      if(type2 && type2 == '1') {
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
        if(this.user_account) {
          this.use_bonus_handler('notGetTotal');
        } else {
          this.is_use_bonus = false;
          this.use_bonus = 0;
        }

        if(type && type == '1'){
          this.getTotal(1);   
        }
        else {
          this.getTotal(0);
        }

        this.computedCartsLength();
        if(this.cartsSLength != this.cartsLength) {
          this.showMessage('抱歉，您選購的商品已下架', false);
        }
      }
    },
    setCarts(){
      if(this.showPage === 'singleProduct') {
        localStorage.setItem(`${this.site.Name}@${this.selectProduct.ID}@carts`, JSON.stringify(this.carts));
      }
      else {
        if(this.user_account) {
          localStorage.setItem(`${this.site.Name}@${this.user_account}@carts`, JSON.stringify(this.carts));
        }
        else {
          localStorage.setItem(`${this.site.Name}@carts`, JSON.stringify(this.carts));
        }
      }
      this.computedCartsLength();
    },

    //
    getFavorite() {
      let vm = this;

      vm.user_account = localStorage.getItem('user_account');
      if(vm.user_account) {
        let formData = new FormData();
        formData.append("storeid", vm.site.Name);
        formData.append("phone", vm.user_account);

        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.open('post',`${vm.protocol}//${vm.api}/interface/WebMember/FavoriteInfo`, true);
        xhr.send(formData);
        xhr.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            if(!JSON.parse(xhr.response).status) {
              if(JSON.parse(xhr.response).msg == '請先登入會員') {
                localStorage.removeItem('user_account');
                vm.getFavorite()
              }
              else {
                vm.favorite = {};
              }
              return
            }

            let favorite_list = JSON.parse(xhr.response).datas[0];
            vm.favorite = {};
            for(let favorite of favorite_list){
              let id = favorite.Product;
              let index = vm.products.map((item) => item.ID).indexOf('' + id);
              if(index > -1){
                vm.$set(vm.favorite, id, vm.products[index])
              }
            }
          }
        }
      }
      else {
        vm.favorite = JSON.parse(localStorage.getItem(`${vm.site.Name}@favorite`)) || {};
        for(let key in vm.favorite) {
          let favorite = vm.favorite[key];
          let index = vm.products.map((item) => item.ID).indexOf(favorite.ID)
          favorite = vm.products[index];
        }
      }
    },
    toggleFavorite(id) {
      let vm = this;

      if(vm.user_account) {
        // delete
        if(vm.favorite[id]){
          let formData = new FormData();
          formData.append("storeid", vm.site.Name);
          formData.append("phone", vm.user_account);
          formData.append("productid[]", id);

          let xhr = new XMLHttpRequest();
          xhr.withCredentials = true;
          xhr.open('post',`${vm.protocol}//${vm.api}/interface/WebMember/DeleteFavorite`, true);
          xhr.send(formData);
          xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              if(!JSON.parse(xhr.response).status) {
                if(JSON.parse(xhr.response).msg == '請先登入會員') {
                  localStorage.removeItem('user_account');
                }
              }
              vm.getFavorite();
            }
          }
        }
        // add
        else {
          let formData = new FormData();
          formData.append("storeid", vm.site.Name);
          formData.append("phone", vm.user_account);
          formData.append("productid[]", id);

          let xhr = new XMLHttpRequest();
          xhr.withCredentials = true;
          xhr.open('post',`${vm.protocol}//${vm.api}/interface/WebMember/AddFavorite`, true);
          xhr.send(formData);
          xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              if(!JSON.parse(xhr.response).status) {
                if(JSON.parse(xhr.response).msg == '請先登入會員') {
                  localStorage.removeItem('user_account');
                }
              }
              vm.getFavorite();
            }
          }
        }
      }
      else {
        if(vm.favorite[id]){
          vm.$delete(vm.favorite, id)
        }
        else {
          vm.products.forEach((item) => {
            if(item.ID === id){
              vm.$set(vm.favorite, id, item)
            }
          })
        }
        localStorage.setItem(`${vm.site.Name}@favorite`, JSON.stringify(vm.favorite))
      }
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
          vm.showMessage('恭喜您獲得折扣', true);
          vm.isDiscountMessage = false;
        } else if (data == 0){
          message = '抱歉您的折扣碼無效，請重新輸入';
        } else if (data == 2){
          message = '抱歉此折扣碼已使用完，請重新輸入';
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
        vm.showMessage('需要專人服務處理，請聯繫客服', false);
        vm.login();
      });
    },

    unDiscount(){
      this.discountCode = '';
      this.useCodeSuccess = '';
      this.getTotal(0);
    },
    
    createCartsStr() {
      let vm = this;
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
        let c_NowPrice = vm.numberThousands(c.NowPrice);
        if(c.buyQty){
          o.id += ( o.id ==='' ? `${c.ID}`  : `,${c.ID}` );
          o.price += ( o.price ==='' ? `${c.NowPrice}`  : `,${c.NowPrice}` );
          o.qry += ( o.qry ==='' ? `${c.buyQty}`  : `,${c.buyQty}` );
          o.ItemName +=  o.ItemName ? '#' : '';
          o.ItemName += `${c.Name} NT$${c_NowPrice} x ${c.buyQty}`;
        }
        else{
          for(let j = 0; j < c.specArr.length; j ++){
            if( c.specArr[j].buyQty != 0){
              o.specificationid += ( o.specificationid ==='' ? `${c.specArr[j].ID}`  : `,${c.specArr[j].ID}` );
              // o.specificationprice += ( o.specificationprice ==='' ? `${c.NowPrice}`  : `,${c.NowPrice}` );
              o.specificationqty += ( o.specificationqty ==='' ? `${c.specArr[j].buyQty}`  : `,${c.specArr[j].buyQty}` );

              o.ItemName +=  o.ItemName ? '#' : '';
              o.ItemName += `${c.Name} (${c.specArr[j].Name}) NT$${c_NowPrice} x ${c.specArr[j].buyQty}`;
            }
          }
        }
        
        if(c.addPrice){
          for( let j = 0; j < c.addPrice.length; j++){
            let item = c.addPrice[j];
            let item_Price = vm.numberThousands(item.Price);
            if(item.Qty || item.Qty == 0){
              if(item.Qty != 0){
                o.additionalid += ( o.additionalid === "" ? `${item.ID}`  : `,${item.ID}` );
                o.additionalprice += ( o.additionalprice === "" ? `${item.Price}`  : `,${item.Price}` );
                o.additionalqry += ( o.additionalqry === "" ? `${item.Qty}`  : `,${item.Qty}` );
                
                o.ItemName +=  o.ItemName ? '#' : '';
                o.ItemName += `加價購 ${item.Name} NT$${item_Price} x ${item.buyQty}`;
              }
            }
            else {
              for(let k = 0; k < item.specArr.length; k++){
                if(  item.specArr[k].buyQty ){
                  o.specificationid += ( o.specificationid ==='' ? `${item.specArr[k].ID}`  : `,${item.specArr[k].ID}` );
                  // o.specificationprice += ( o.specificationprice ==='' ? `${c.NowPrice}`  : `,${c.NowPrice}` );
                  o.specificationqty += ( o.specificationqty ==='' ? `${item.specArr[k].buyQty}`  : `,${item.specArr[k].buyQty}` );
                
                  o.ItemName +=  o.ItemName ? '#' : '';
                  o.ItemName += `加價購 ${item.Name} (${item.specArr[k].Name}) NT$${item_Price} x ${item.specArr[k].buyQty}`;
                }
              }
            }
          }
        }
      })
      return o;
    },
    async getTotal(type){
      const vm = this;

      return new Promise((resolve, reject) => {
        let o = vm.createCartsStr();
        if( !o.id && !o.specificationid ){
          return;
        }
        vm.site = JSON.parse(localStorage.getItem('site')) || [] ;
        const url = `${vm.protocol}//${vm.api}/interface/store/GetProductTotal?`;

        let formData = new FormData();
        formData.append('id', o.id);
        formData.append('qry', o.qry);
        formData.append('additionalid', o.additionalid);
        formData.append('additionalqry', o.additionalqry);
        formData.append('specificationid', o.specificationid);
        formData.append('specificationqty', o.specificationqty);
        formData.append('code', vm.useCodeSuccess);
        let shipping
        if(vm.transport === '0') shipping = 3
        else if(vm.transport === '1') shipping = 2
        else if(vm.transport === '2') shipping = 3
        else shipping = 4
        formData.append('shipping', shipping);
        if(shipping === 4) formData.append('Mart', vm.transport);
        formData.append('type', type);
        formData.append('Preview', vm.site.Preview);
        formData.append('memberWallet', vm.is_use_bonus ? vm.use_bonus : 0);

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };
        vm.$http.post(url, formData, config).then((res) => {

          if(res.data.errormessage){
            console.log(res.data.errormessage)
            return;
          }

          vm.total = res.data.data[0];

          vm.bonus_percent = 0
          for(let item of vm.bonus_array) {
            if((parseInt(vm.total.Sum) - parseInt(vm.total.Shipping)) >= item.lower) {
              vm.bonus_percent = item.shipping;
            }
          }
          resolve()
        }).catch((err) => {
          console.error(err)
          resolve()
        });
      })
    },

    // checkOrder confirm 
    async cancelDiscountCodeCreateOrder() {
      let vm = this;
      vm.discountCode = '';
      vm.useCodeSuccess = '';
      await vm.getTotal(1)
      vm.isConfirm2 = false;
      vm.createOrder();
    },
    async checkOrder() {
      const vm = this;

      if(vm.site.Preview == 2 ){
        vm.showMessage( '預覽模式不開放完成訂單', false);
        return;
      }
      if(vm.orderIng){
        return;
      }

      vm.is_click_finish_order = true;
      vm.validate('purchaser_email', 'required', 'email') 
      vm.validate('purchaser_name', 'required', 'name', 'nameLength') 
      vm.validate('purchaser_number', 'required', 'phone') 
      vm.validate('receiver_name', 'required', 'name', 'nameLength') 
      vm.validate('receiver_number', 'required')
      if(
        // 資訊驗證
        !vm.info.purchaser_email_error &&
        !vm.info.purchaser_name_error &&
        !vm.info.purchaser_number_error &&
        !vm.info.receiver_name_error &&
        !vm.info.receiver_number_error &&
        // 運送驗證
        vm.transport !== '0' &&
        // 支付驗證
        vm.pay_method !== '0' &&
        // 發票驗證
        (
          (vm.store.Receipt === '0') || 
          (vm.invoice_type === '1') ||
          (vm.invoice_type === '2' && vm.invoice_title !== '' && vm.invoice_uniNumber !== '') ||
          (vm.invoice_type === '3' && vm.phone_barCode !== '') ||
          (vm.invoice_type === '4' && vm.natural_barCode !== '')
        ) &&
        // 地址驗證
        ( vm.transport === '1' ? (vm.city_active && vm.district_active && vm.detail_address) : true) &&
        // 門市驗證
        ( vm.is_store ? vm.storeid !== '' : true)
      ) {
        await vm.use_bonus_handler();
        vm.createOrder();
      }
    },

    //
    clearCarts() {
      if(this.showPage === 'singleProduct') {
        this.carts = [];
        this.discountCode = '';
        this.useCodeSuccess = '';
        this.stepIndex= 1;
        this.getProducts();
        return
      }

      this.carts = [];
      this.setCarts();

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
      this.isConfirm = false;

      // LinePay
      if(this.pay_method == 'LinePay') {
        this.urlPush(this.payResult.payUrl)
      }
      // company account
      else if(this.pay_method == 'ATM' && this.store.ATM == 1){
        this.bank = require('../assets/bank.json');
        this.isConfirm3 = true;
      }
      else if(this.pay_method == 'PayOnDelivery' || this.pay_method == 'MartPayOnDelivery') {

      }
      // ecpay
      else {
        if(this.webVersion === 'demo') {
          this.ECPay_form = `<form id="ECPay_form" action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5" method="post">`
        } else {
          this.ECPay_form = `<form id="ECPay_form" action="https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5" method="post">`
        }

        for(let item in this.payResult){
          if(item === 'success' || item === 'message' || item === 'membered') continue
          // EncryptType TotalAmount item: number，other: string
          this.ECPay_form += `<input type="${item == 'EncryptType' || item == 'TotalAmount' || item == 'ExpireDate' ? 'number' : 'text'}" name="${item}" value="${this.payResult[item]}">`;
        }
        this.ECPay_form += `</form>`;

        this.$nextTick(()=>{
          let ECPay_form = document.querySelector('#ECPay_form');
          ECPay_form.submit();
        })
      }
    },

    // register
    required_verify(item) {
      if(!item.hasOwnProperty('value')){
        if (!item.city || !item.district || !item.detail ) {
          item.is_error = true;
          item.message = item.rules.required.message;
          return false;
        }
        else {
          item.is_error = false;
          item.message = '';
          return true;
        }
      }
      else {
        if (!item.value) {
          item.is_error = true;
          item.message = item.rules.required.message;
          return false;
        }
        else {
          item.is_error = false;
          item.message = '';
          return true;
        }
      }
    },
    name_verify(item) {
      let regExp = /^[\u4e00-\u9fa5]+$|^[a-zA-Z]+$/
      if(!regExp.test(item.value)) {
        item.is_error = true;
        item.message = item.rules.name.message;
        return false;
      }
      else {
        item.is_error = false;
        item.message = '';
        return true;
      }
    },
    nameLength_verify(item) {
      let chineseRegExp = /^[\u4e00-\u9fa5]+$/
      let englishRegExp = /^[a-zA-Z]+$/
      let is_error = false
      if(chineseRegExp.test(item.value)) {
        if(item.value.length > 5 || item.value.length < 2) {
          is_error = true
        }
      } else if(englishRegExp.test(item.value)) {
        if(item.value.length > 10 || item.value.length < 4) {
          is_error = true
        }
      }

      if(is_error) {
        item.is_error = true;
        item.message = item.rules.nameLength.message;
        return false;
      }
      else {
        item.is_error = false;
        item.message = '';
        return true;
      }
    },
    cellphone_verify(item) {
      let rep = /^(09)[0-9]{8}$/;
      if (!rep.test(item.value)) {
        item.is_error = true;
        item.message = item.rules.cellphone.message;
        return false;
      }
      else {
        item.is_error = false;
        item.message = '';
        return true;
      }
    },
    length_verify(item) {
      if (item.value.length < item.rules.length.min || item.value.length > item.rules.length.max) {
        item.is_error = true;
        item.message = item.rules.length.message;
        return false;
      }
      else {
        item.is_error = false;
        item.message = '';
        return true;
      }
    },
    mail_verify(item) {
      let rep = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
      if (!rep.test(item.value)) {
        item.is_error = true;
        item.message = item.rules.mail.message;
        return false;
      }
      else {
        item.is_error = false;
        item.message = '';
        return true;
      }
    },
    confirm_verify(item) {
      if (item.value != this[item.rules.confirm.password].value) {
        item.is_error = true;
        item.message = item.rules.confirm.message;
        return false;
      }
      else {
        item.is_error = false;
        item.message = '';
        return true;
      }
    },
    send_verify_code(){
      if(this.second > 0) return

      if(this.store.NotificationSystem == 0) {
        if( !this.verify(this.r_mail) ) return
      }
      else if(this.store.NotificationSystem == 1) {
        if( !this.verify(this.r_account) ) return
      }
      else {
        if( !this.verify(this.r_account) || !this.verify(this.r_mail) ) return
      }

      let vm = this;

      let formData = new FormData();

      formData.append("phone", this.r_phone.value.trim());
      formData.append("mail", this.r_mail.value.trim());

      formData.append("notificationsystem", this.store.NotificationSystem)
      formData.append("type", this.store.NotificationSystem)

      formData.append("storeName", this.store.Name);
      formData.append("storeid", this.site.Name);

      let xhr = new XMLHttpRequest();
      xhr.withCredentials = true;
      xhr.open('POST', `${vm.protocol}//${vm.api}/interface/WebMember/SendValidateMessage`, true);
      xhr.send(formData);
      xhr.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
          if(JSON.parse(xhr.response).status){
            vm.second = 300;
            let interval =  setInterval(() => {
              vm.second -= 1;
              if(vm.second < 1){
                clearInterval(interval);
              }
            }, 1000)
            vm.showMessage(JSON.parse(xhr.response).msg, true)
          } else {
            vm.showMessage(JSON.parse(xhr.response).msg, false)
          }
        }
      }
    },
    verify(...arr) {
      let is_valid = true;
      for (let item of arr) {
        for (let rule in item.rules) {
          if (!this[`${rule}_verify`](item)) {
            is_valid = false;
            break
          }
        }
      }
      return is_valid;
    },
    check_account() {
      let vm = this;

      return new Promise((resolve, reject) => {
        let formData = new FormData();
        formData.append("storeid", vm.site.Name);
        formData.append("phone", vm.info.purchaser_number);
        formData.append("email", vm.info.purchaser_email);

        formData.append("validate", '');
        formData.append("validate2", '');
        formData.append("type", vm.store.NotificationSystem)
        formData.append("password", '');
        formData.append("name", '');
        formData.append("birthday", '');
        formData.append("gender", 0);
        formData.append("recommender", '');

        const config = {
          headers: {
            // 'Content-Type': 'application/x-www-form-urlencoded'
            'Content-Type': 'multipart/form-data'
          }
        };

        const url = `${vm.protocol}//${vm.api}/interface/WebMember/MemberRegister`;
        this.$http.post(url, formData, config).then((res) => {
          if(res.data.msg.indexOf('已註冊') > -1) {
            // vm.isConfirm5 = false; 
            // vm.toPay()
            // vm.showMessage(res.data.msg, false)
            resolve(true);
          }
          else {
            resolve(false);
          }
        })
        .catch((err) => { 
          console.error(err);
          vm.login(vm.check_account);
        });
      })
    },
    register(){
      if (!this.r_is_agree) {
        return
      }

      let verify_code = [];
      if(this.store.NotificationSystem == 0) {
        verify_code.push(this.r_verify_code2)
      }
      else if(this.store.NotificationSystem == 1) {
        verify_code.push(this.r_verify_code)
      }
      else {
        verify_code.push(this.r_verify_code)
        verify_code.push(this.r_verify_code2)
      }

      if (!this.verify(this.r_name, this.r_mail, this.r_birthday, this.r_account, ...verify_code, this.r_password, this.r_confirm_password)) {
        return
      }

      let vm = this;
      
      let formData = new FormData();
      formData.append("storeid", this.site.Name);
      formData.append("phone", this.r_account.value);
      
      if(this.store.NotificationSystem == 0) {
        formData.append("validate2", this.r_verify_code2.value);
      }
      else if(this.store.NotificationSystem == 1) {
        formData.append("validate", this.r_verify_code.value);
      }
      else {
        formData.append("validate", this.r_verify_code.value);
        formData.append("validate2", this.r_verify_code2.value);
      }
      formData.append("type", this.store.NotificationSystem)

      formData.append("password", this.r_password.value);
      formData.append("name", this.r_name.value);
      let b = this.r_birthday.value
      let birthday
      if(b) {
        birthday = `${b.getFullYear()}/${b.getMonth() + 1 < 10  ? '0' : '' }${b.getMonth() + 1}/${b.getDate() < 10  ? '0' : '' }${b.getDate()}`
      }
      else {
        birthday = ''
      }
      formData.append("birthday", birthday);
      formData.append("gender", this.sex == 'male' ? 1 : 0 );
      formData.append("email", this.r_mail.value);
      formData.append("recommender", '');

      const config = {
        headers: {
          // 'Content-Type': 'application/x-www-form-urlencoded'
          'Content-Type': 'multipart/form-data'
        }
      };

      const url = `${vm.protocol}//${vm.api}/interface/WebMember/MemberRegister`;
      this.$http.post(url, formData, config).then((res) => {
        if(res.data.errormessage){
          return;
        }
        if(res.data.status){
          vm.showMessage(res.data.msg, true)
          setTimeout(function(){
            vm.isConfirm5 = false; 
            vm.toPay()
          }, 3000)
        }
        else{
          vm.showMessage(res.data.msg, false)
        }
      })
      .catch((err) => { 
        console.error(err);
        vm.login(vm.register);
      });
    },
    auto_info(){
      this.r_account.value = this.info.purchaser_number;
      this.r_name.value = this.info.purchaser_name;
      this.r_mail.value = this.info.purchaser_email;
    },
    createOrder(){
      this.orderIng = true;
      let o = this.createCartsStr();

      let url = `${this.protocol}//${this.api}/LineMK/Line/OrderPayRequest`;
      
      let formData = new FormData();
      if(true){
        formData.append('Site' , this.site.Site);
        formData.append('StoreName' , this.site.Name);
        formData.append('productName' , this.store.Name);
        formData.append('Preview' , this.site.Preview);

        formData.append('ProductIdList' , o.id);
        formData.append('PriceList' , o.price);
        formData.append('AmountList' , o.qry);
        formData.append('ExtraProductIdList' , o.additionalid);
        formData.append('ExtraPriceList' , o.additionalprice);
        formData.append('ExtraAmountList' , o.additionalqry);
        formData.append('ItemName' , o.ItemName);
        formData.append('SizeIdList' , o.specificationid);
        formData.append('SizeAmountList' , o.specificationqty);

        formData.append('Email' , this.info.purchaser_email);
        formData.append('Name' , this.info.purchaser_name);
        formData.append('Phone' , this.user_account);
        formData.append('Phone2' , this.info.purchaser_number);
        formData.append('Receiver' , this.info.receiver_name);
        formData.append('ReceiverPhone' , this.info.receiver_number);
        formData.append('Message' , this.info.info_message);

        if(this.transport === '1' || this.transport === '2') {
          formData.append('SendWay' , this.transport);
          formData.append('PayMethod' , this.pay_method);
          formData.append('PayType' , this.store[this.pay_method]);
        }
        else {
          formData.append('SendWay' , 3);
          formData.append('Mart' , this.transport);

          if(this.transport.indexOf('Delivery') > -1) {
            formData.append('PayMethod' , this.transport)
            formData.append('PayType' , 1)
          }
          else {
            formData.append('PayMethod' , this.pay_method)
            formData.append('PayType' , this.store[this.pay_method])
          }

          // 0 代收 1 不代收
          formData.append('IsCollection', this.transport.indexOf('Delivery') > -1 ? 0 : 1)
        }

        // 地址
        if(this.is_store) formData.append('Address', encodeURI(`${this.storeid} - ${this.storename} - ${this.storeaddress}`));
        else formData.append('Address' , encodeURI(this.receiver_address));
        if(this.userInfo.address_obj && Object.keys(this.userInfo.address_obj).length < 3 && !this.has_address && this.is_save_address){
          let id = new Date().getTime();
          formData.append('saveAddressStr' , encodeURI(`${id}_ _${this.receiver_address.replace(/ /g, '_ _')}`) );
        }
        else formData.append('saveAddressStr' , '');

        // 郵遞區號
        if(this.city_active && this.district_active) {
          formData.append('ZipCode' , this.city_district[this.city_active][this.district_active]);
        }
        else formData.append('ZipCode' , '');

        // 超商取貨付款
        if(this.is_store) formData.append('StoreID' , this.storeid);
        // 發票
        formData.append('Type' , this.invoice_type * 1);
        formData.append('Title' , this.invoice_title);
        if(this.invoice_type === '3') {
          formData.append('UniNumber' , this.phone_barCode);
          formData.append('savePhoneCode' , this.phone_barCode);
          formData.append('saveNatureCode' , '');
        }
        else if(this.invoice_type === '4') {
          formData.append('UniNumber' , this.natural_barCode)
          formData.append('savePhoneCode' , '');
          formData.append('saveNatureCode' , this.natural_barCode);
        }
        else formData.append('UniNumber' , this.invoice_uniNumber);
        
        formData.append('Discount' , this.total.Discount * 1);
        formData.append('Shipping' , this.total.Shipping * 1);
        formData.append('Total' , this.total.Sum * 1);
        formData.append('DiscountPrice' , this.total.DiscountCode * 1);

        formData.append('DiscountCode' , this.useCodeSuccess);
        
        formData.append('MemberWallet' , this.use_bonus);
        formData.append('MemberBonus' , this.member_bonus);

        formData.append('LogoUrl' , this.protocol + '//' + this.api + this.store.PayLogo);
      }
      const config = {
        headers: {
          // 'Content-Type': 'application/x-www-form-urlencoded'
          'Content-Type': 'multipart/form-data'
        }
      };
      const vm = this;
      this.$http.post(url, formData, config)
      .then(async (res) => {
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
          
          if(res.data.message === '購物金不足。'){
            await vm.getUserInfo();
            vm.use_bonus = 0;
            vm.getTotal(1);
          }

          return;
        }
        else {
          vm.orderIng = false;

          vm.payResult = res.data;

          // 沒有開啟會員功能
          if(!(vm.site.MemberFuction * 1)){
            vm.isConfirm = true;
          }
          else {
            // 沒有登入
            if(!vm.user_account){
              let hasAcount = await vm.check_account();
              if(hasAcount) {
                vm.isConfirm = true;
              } else {
                vm.isConfirm4 = true;
              }
            }
            // 登入
            else {
              vm.isConfirm = true;
              vm.is_use_bonus = false;
              vm.use_bonus = 0;
              vm.getUserInfo()
            }
          }

          vm.clearCarts();
        }
      })
      .catch((err) => {
        console.error(err);
        vm.login();
        vm.showMessage('需要專人服務處理，請聯繫客服', false)
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
        vm.showMessage(`抱歉，${itemStr}已下架`, false);
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
          vm.$delete(product, 'buyQty');
          vm.$set(product, 'buyQty', qty);
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
    updateProductsBuyQty(product, qty, e, data){
      let vm = this;
      let isfly = true;

      let validate = vm.updateBuyQtyValidate(product, qty, data, '商品');
      if(!validate){
        return;
      }
      else if( validate == 1 ){
        qty = 0;
      } 
      else if ( product.Enable == 1 ) {
        if( qty*1 > product.Amount*1 ){
          qty = product.Amount*1;
        }
      }

      qty = qty * 1;

      let isAdd = qty - product.buyQty;
      isfly = isAdd ? true : false;
      // update pageFilterProduct ( bind view )
      vm.$delete(product, 'buyQty');
      vm.$set(product, 'buyQty', qty);
      

      let changing = product;

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
        let i 
        vm.pageFilterProduct.forEach((item, index) => {
          if(item.ID === product.ID) {
            i = index
          }
        })
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
                vm.$delete(product.addPrice[j], 'Qty');
                vm.$set(product.addPrice[j], 'Qty', qty);
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
      vm.$delete(item.addPrice[i], 'Qty');
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
              vm.$delete(product.specArr[j], 'buyQty');
              vm.$set(product.specArr[j], 'buyQty', qty);
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
    updateProductsBuyQty_spec(product, qty, i2, e, data){
      let vm = this;
      let isfly = true;

      let validate = vm.updateBuyQtyValidate( product.specArr[i2], qty, data, '此規格')
      if(!validate){
        return;
      }
      else if( validate == 1 ){
        qty = 0;
      } 
      else if ( product.specArr[i2].Enable == 1 ) {
        if( qty*1 > product.specArr[i2].Amount*1 ){
          qty = product.specArr[i2].Amount*1;
        }
      }

      qty = qty * 1;

      let isAdd = qty - product.specArr[i2].buyQty;
      isfly = isAdd ? true : false;
      // update pageFilterProduct ( bind view )
      vm.$delete(product.specArr[i2], 'buyQty');
      vm.$set(product.specArr[i2], 'buyQty', qty);

      // update carts
      let cartsIndex = -1;
      let changing = product.specArr[i2];
      vm.carts.forEach((item, index)=>{
        if(item.ID === product.ID){
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
        vm.carts.push(JSON.parse(JSON.stringify(product)));
      }

      let maxQty =  vm.itemTotalQty(product);
      if(!maxQty){
        vm.carts.splice(cartsIndex, 1);
      }

      // set carts
      vm.setCarts();

      // fly
      if(e && isfly){
        let i 
        vm.pageFilterProduct.forEach((item, index) => {
          if(item.ID === product.ID) {
            i = index
          }
        })
        vm.flyHandler(i, isAdd, e);
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
                      vm.$delete(product.addPrice[j].specArr[k], 'buyQty');
                      vm.$set(product.addPrice[j].specArr[k], 'buyQty', qty);
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
      vm.$delete(item.addPrice[i].specArr[i2], 'buyQty');
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

    // 
    showFavorite(id) {
      let vm = this;
      let index = vm.products.map((item) => item.ID).indexOf(id);
      vm.showSelect( vm.products[index], index)
    },

    // this.showPage = 'selectProduct'; 
    showSelect( item, index) {
      this.selectProduct = item; 
      this.selectIndex = index; 
      this.showPage = 'selectProduct';
      window.history.replaceState({}, document.title, `${location.pathname}?id=${item.ID}`);
      this.getAddPrice(item.ID, item, '1'); 
    },

    // carts step
    stepOneToTwo(){
      this.getStore();
      this.getProducts('1');
      let newUser_account = localStorage.getItem('user_account');
      if(newUser_account) this.getUserInfo();
      if(newUser_account != this.user_account) {
        this.user_account = newUser_account
        if(!this.user_account) {
          this.userInfo = {}
          this.info = {
            purchaser_email:'',
            purchaser_name:'',
            purchaser_number:'',
            receiver_name:'',
            receiver_number:'',
            info_message:''
          }
        }
      }
      this.stepIndex = 2;
      if(this.showPage === 'singleProduct') return
      this.$refs.cartScroll.scrollTop = 0;
    },
    // carts info
    pInput(){
      if(this.isSame){
        this.info.receiver_name = this.info.purchaser_name;
        this.info.receiver_number = this.info.purchaser_number;

        this.validate('purchaser_name', 'required', 'name', 'nameLength')
        this.validate('purchaser_number', 'required')
      }
    },
    info_message_input(){
      if(this.info.info_message.length > 150){
        this.info.info_message = this.info.info_message.substring(0, 150);
      }
    },

    numberInput(item){
      let type = item.buyQty === undefined ? 'Qty' : 'buyQty';
      let str = item[type].toString();
      this.$set(item, type, str.replace(/[^\d]/g, '') )
    },
    numberInput_2(event){
      event.srcElement.value = event.srcElement.value.replace(/[^\d]/g,'')
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
          let newHeight = parseInt(itemHeight / ( itemWidth/contentWidth ));
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

    // 
    numberThousands(number) {
      return String(number).replace( /(\d)(?=(?:\d{3})+$)/g, '$1,')
    },

    //
    click_share_link() {
      if(this.showPage === 'singleProduct') {
        this.copy( `${this.protocol}//${this.api}${location.pathname}?spid=${this.selectProduct.ID}`, '#copy_input2');
      }
      else {
        this.copy( `${this.protocol}//${this.api}${location.pathname}?id=${this.selectProduct.ID}`, '#copy_input2');
      }
      this.showMessage('複製分享連結', true);
    },

    // 超商取貨
    pickStore() {
      let order_info = {
        discountCode: this.discountCode,
        useCodeSuccess: this.useCodeSuccess,

        info: {
          purchaser_email: this.info.purchaser_email,
          purchaser_name: this.info.purchaser_name,
          purchaser_number: this.info.purchaser_number,
          receiver_name: this.info.receiver_name,
          receiver_number: this.info.receiver_number,
          info_message: this.info.info_message, 
        },
        isSame: this.isSame,
        transport: this.transport,
        pay_method: this.pay_method,
  
        invoice_type: this.invoice_type,
        personal_or_company: this.personal_or_company,
        phone_barCode: this.phone_barCode,
        natural_barCode: this.natural_barCode,
        invoice_title: this.invoice_title,
        invoice_uniNumber: this.invoice_uniNumber,

        is_use_bonus: this.is_use_bonus,
        use_bonus: this.use_bonus,
      }
      localStorage.setItem('order_info', JSON.stringify(order_info));

      if(this.webVersion == 'demo') {
        this.ECPay_store_form = `<form id="ECPay_store_form" action="https://logistics-stage.ecpay.com.tw/Express/map" method="post">`
      } else {
        this.ECPay_store_form = `<form id="ECPay_store_form" action="https://logistics.ecpay.com.tw/Express/map" method="post">`
      }

      let MerchantID
      if(this.webVersion === 'demo') MerchantID = this.transport.indexOf('C2C') > -1 ? '2000933' : '2000132'
      else MerchantID = this.store.ECStore
      let LogisticsSubType = this.transport.replace('Delivery', '')
      let IsCollection = this.transport.indexOf('Delivery') > -1 ? 'Y' : 'N'
      let obj = {
        MerchantID,
        MerchantTradeNo: '',
        LogisticsType: 'CVS',
        LogisticsSubType,
        IsCollection,
        ServerReplyURL: `${location.origin}/interface/store/SpmarketAddress${this.showPage == 'singleProduct' ? '?spid=' + this.selectProduct.ID : ''}`,
        ExtraData: '',
        Device: ''
      }

      for(let key in obj) {
        this.ECPay_store_form += `<input type="${key == 'Device' ? 'number' : 'text'}" name="${key}" value="${obj[key]}">`;
      }
      this.ECPay_store_form += `</form>`;

      this.$nextTick(()=>{
        let ECPay_store_form = document.querySelector('#ECPay_store_form');
        ECPay_store_form.submit();
      })

      // 7-11
      // this.urlPush(`https://emap.presco.com.tw/c2cemap.ashx?url=${location.origin}/interface/store/SpmarketAddress${this.showPage == 'singleProduct' ? '?spid=' + this.selectProduct.ID : ''}`);
    },
    returnInfo() {
      let order_info = JSON.parse(localStorage.getItem('order_info')) || {};

      this.discountCode = order_info.discountCode
      this.useCodeSuccess = order_info.useCodeSuccess

      this.info = {
        purchaser_email: order_info.info.purchaser_email,
        purchaser_name: order_info.info.purchaser_name,
        purchaser_number: order_info.info.purchaser_number,
        receiver_name: order_info.info.receiver_name,
        receiver_number: order_info.info.receiver_number,
        info_message: order_info.info.info_message 
      }
      this.isSame = order_info.isSame
      this.transport = order_info.transport
      this.pay_method = order_info.pay_method
    
      this.invoice_type = order_info.invoice_type
      this.personal_or_company = order_info.personal_or_company
      this.phone_barCode = order_info.phone_barCode
      this.natural_barCode = order_info.natural_barCode
      this.invoice_title = order_info.invoice_title
      this.invoice_uniNumber = order_info.invoice_uniNumber

      this.is_use_bonus = order_info.is_use_bonus
      this.use_bonus = order_info.use_bonus
    },

    urlPush(url, is_open) {
      if(is_open) {
        window.open(url);
      }
      else {
        window.location.href = url;
      }
    },

    copy(text, selector){
      let copy_input = document.querySelector(selector);
      copy_input.value = text;
      copy_input.select();
      document.execCommand('copy');
    },

    // 
    async use_bonus_handler(notGetTotal) {
      let vm = this;
      vm.use_bonus  = parseInt(vm.use_bonus);

      let use_bonus_max = Math.min(vm.total_bonus * 1, vm.total.Total * 1 - vm.total.Discount * 1 - vm.total.DiscountCode * 1)
      if(vm.use_bonus > use_bonus_max) {
        vm.use_bonus = use_bonus_max
      }
      if(vm.use_bonus <= 0) vm.use_bonus = 0;

      if(notGetTotal === 'notGetTotal') return
      await vm.getTotal(1)
    },

    // shopping
    getPathname(page) {
      let pageObj = {
        index: {
          'common': '/',
          'demo': '/',
          'uniqm.com': '/',
          'uniqm.net': '/',
        },
        order: {
          'common': '/order.html',
          'demo': '/order.html',
          'uniqm.com': '/shoppingOrder.html',
          'uniqm.net': '',
        },
        user: {
          'common': '/user.html',
          'demo': '/user.html',
          'uniqm.com': '/shoppingUser.html',
          'uniqm.net': '',
        },
        info: {
          'common': '/user_info.html',
          'demo': '/user_info.html',
          'uniqm.com': '/shoppingInfo.html',
          'uniqm.net': '',
        },
      }

      return pageObj[page][this.webVersion];
    },

    // swiper
    initSwiper() {
      this.swiper = new Swiper('.swiper-container', {
        slidesPerView: 3,
      })
    },

    validate(key, ...arr) {
      let vm = this
      let value = vm.info[key]
      for(let item of arr) {
        if(item == 'required') {
          if(value == '') {
            vm.info[`${key}_error`] = '不得為空'
            return false
          }
        }

        else if(item == 'name') {
          let regExp = /^[\u4e00-\u9fa5]+$|^[a-zA-Z]+$/
          if(!regExp.test(value)) {
            vm.info[`${key}_error`] = '請輸入全中文或全英文'
            return false;
          }
        }

        else if(item == 'nameLength') {
          let chineseRegExp = /^[\u4e00-\u9fa5]+$/
          let englishRegExp = /^[a-zA-Z]+$/
          if(chineseRegExp.test(value)) {
            if(value.length > 5 || value.length < 2) {
              vm.info[`${key}_error`] = '中文長度請介於2~5，英文長度請介於4~10'
              return false;
            }
          } else if(englishRegExp.test(value)) {
            if(value.length > 10 || value.length < 4) {
              vm.info[`${key}_error`] = '中文長度請介於2~5，英文長度請介於4~10'
              return false;
            }
          }
        }

        else if(item == 'email') {
          let rep = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
          if(!rep.test(value)) {
            vm.info[`${key}_error`] = '請輸入正確的Email'
            return false
          }
        }
        else if(item == 'phone') {
          let rep = /^(09)[0-9]{8}$/;
          if (!rep.test(value)) {
            vm.info[`${key}_error`] = '請輸入正確的手機號碼'
            return false
          }
        }
      }
      vm.info[`${key}_error`] = ''
      return true
    }
  },
  created(){
    const vm = this;
    vm.api = location.host;
    vm.protocol = location.protocol;
  },
  mounted(){
    let vm = this;
    vm.getSite();
    vm.innerHeight = window.innerHeight;
    window.onresize = () => {
      vm.innerHeight = window.innerHeight;
    }

    vm.city_district = require('../assets/city_district.json');
  }
}
</script>

<style lang="scss">
  @import "../assets/css/quill.css";
  @import "../assets/scss/index.scss";
</style>
