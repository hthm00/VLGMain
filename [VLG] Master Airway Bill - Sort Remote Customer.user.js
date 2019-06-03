// ==UserScript==
// @name         [VLG] Master Airway Bill - Sort Remote Customer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Sort remote customer
// @author       Minh Huynh
// @match        https://vietlinkglobal.com/admin/master-shipment/*/show
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @connect      vietlinkglobal.com
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://unpkg.com/jspdf@latest/dist/jspdf.min.js
// ==/UserScript==

(function() {
    'use strict';

    var shipmentsData = new Map();
    var count = 1000;
    const exportListId = $('.master-shipment.detail-master-shipment:eq(0)').attr('data-export_list_id');
    var searchRequestCount = 0, invoiceRequestCount = 0;

    const MAWBNum = $('.mawb-shipping-detail.row:eq(0) .x_content:eq(0) .row:eq(0) .col-xs-12:eq(2)').html().trim();

    const copyRemoteCusEmailsDiv = $(`<a id="copy-remote-customer-emails" class="btn btn-default disabled">
        Getting Remote Customers Data...
      </a>`);
    function mapToObj(inputMap) {
        let obj = {'MAWBNum': '', 'remoteCustomersData': {}};
        console.log(obj);
        obj['MAWBNum'] = MAWBNum;
        //obj["remoteCustomerData"] = {};

        inputMap.forEach(function(value, key){
            obj['remoteCustomersData'][key] = value
        });

        return obj;
    }
    $('.row.x_title:eq(0)').append(copyRemoteCusEmailsDiv);
    $('.row.x_title:eq(0)').on('click', () => {
        //console.log(mapToObj(shipmentsData));
        GM_setClipboard(JSON.stringify(mapToObj(shipmentsData)));
    })

    var masterAirwayBillApi = `https://vietlinkglobal.com/admin/master-shipment/detail-full?_=1558683029777&columns%5B0%5D%5Bdata%5D=0&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Borderable%5D=true&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B1%5D%5Bdata%5D=1&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B2%5D%5Bdata%5D=2&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B3%5D%5Bdata%5D=3&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B4%5D%5Bdata%5D=4&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B5%5D%5Bdata%5D=5&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B6%5D%5Bdata%5D=6&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Borderable%5D=true&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B7%5D%5Bdata%5D=7&columns%5B7%5D%5Bname%5D=&columns%5B7%5D%5Borderable%5D=true&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearchable%5D=true&columns%5B8%5D%5Bdata%5D=8&columns%5B8%5D%5Bname%5D=&columns%5B8%5D%5Borderable%5D=true&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B8%5D%5Bsearchable%5D=true&draw=1&exportListId=${exportListId}&length=1000&search%5Bregex%5D=false&search%5Bvalue%5D=&start=0`
    GM_xmlhttpRequest ( {
        method:         "GET",
        url:            masterAirwayBillApi,
        responseType:   "json",
        onload:         masterAirwayBill_Response,
        onabort:        reportAJAX_Error,
        onerror:        reportAJAX_Error,
        ontimeout:      reportAJAX_Error
    } );

    function masterAirwayBill_Response (rspObj) {
        if (rspObj.status != 200) {
            reportAJAX_Error (rspObj);
            return;
        }
        var pyLd = rspObj.response.data;
        var remoteCustomerCodes = [];
        if (pyLd.length > 0) {
            pyLd.forEach((item) => {
                const invoice = item[0].match('<u>(.*?)</u>')[1];
                const invoiceLink = item[0].match('<a href=\"(.*?)\"')[1].replace('detail','print?print_type%5B%5D=receipt_for_customer_2');
                const customerCode = invoice.substring(0,5);
                const checkerCode = customerCode.substring(1,5);
                if (!isNaN(checkerCode)) {
                    shipmentsData.set(invoice, {email: '', invoiceTitle: invoice.trim(), invoiceFile: ''})
                    // Request invoice
                    const invoiceApi = `https://vietlinkglobal.com${invoiceLink}`
                    GM_xmlhttpRequest ( {
                        method:         "GET",
                        url:            invoiceApi,
                        responseType:   "text/html",
                        onload:         invoice_Response,
                        onabort:        reportAJAX_Error,
                        onerror:        reportAJAX_Error,
                        ontimeout:      reportAJAX_Error
                    } );

                    remoteCustomerCodes.push(customerCode);
                }
            });
            console.log(remoteCustomerCodes);
            count = remoteCustomerCodes.length;
            remoteCustomerCodes.forEach((remoteCustomerCode) => {
                const searchCustomerApi = `https://vietlinkglobal.com/admin/customer/remote/datatable?draw=3&columns[0][data]=0&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=true&columns[0][search][value]=&columns[0][search][regex]=false&columns[1][data]=1&columns[1][name]=&columns[1][searchable]=true&columns[1][orderable]=true&columns[1][search][value]=&columns[1][search][regex]=false&columns[2][data]=2&columns[2][name]=&columns[2][searchable]=true&columns[2][orderable]=true&columns[2][search][value]=&columns[2][search][regex]=false&columns[3][data]=3&columns[3][name]=&columns[3][searchable]=true&columns[3][orderable]=true&columns[3][search][value]=&columns[3][search][regex]=false&columns[4][data]=4&columns[4][name]=&columns[4][searchable]=true&columns[4][orderable]=true&columns[4][search][value]=&columns[4][search][regex]=false&start=0&length=20&search[value]=${remoteCustomerCode}&search[regex]=false&_=1558685896481`;
                GM_xmlhttpRequest ( {
                    method:         "GET",
                    url:            searchCustomerApi,
                    responseType:   "json",
                    onload:         searchCustomer_Response,
                    onabort:        reportAJAX_Error,
                    onerror:        reportAJAX_Error,
                    ontimeout:      reportAJAX_Error
                } );
            });


        }
    }

    function invoice_Response(rspObj) {
        invoiceRequestCount = invoiceRequestCount + 1;
        if (rspObj.status != 200) {
            reportAJAX_Error (rspObj);
            return;
        }
        var pyLd = rspObj.response;
        if (pyLd.length > 0) {
            const recipientElement = $($(pyLd)[33]).html();
            const deliveryType = recipientElement.match('(Delivery option: )(.*?)(<br>)')[2];
            const serviceType = recipientElement.match('(Service type: <span style="font-weight: bold;font-size: 16px;">)(.*?)(</span>)')[2];
            const chargableWeight = recipientElement.match('(Chargeable weight: )(.*?)( lbs<br>)')[2];
            const noteCustomer = recipientElement.match('Note for Customer:(.|\n)+(<td colspan="2">)((.|\n)*)(<\/td>)');
            const date = recipientElement.match('(Date: )(.*?)(\n)')[2];
            var packagesInNotes = '';
            var isUPS = false;
            if (noteCustomer) {
                packagesInNotes = noteCustomer[3].split('<br>');
                packagesInNotes.forEach(item => {
                    if (item.includes('1Z')) {
                        isUPS = true;
                    }
                })
            };
            const otherChargeElement = recipientElement.match('(Other Charge: \$)(.*?)(\n)');
            var otherCharge = '';
            if (otherChargeElement) {
                otherCharge = otherChargeElement[2]
            };



//console.log(recipientElement);
            console.log(date);
            console.log(otherChargeElement);
            //console.log(packagesInNotes)

            //const invoiceDiv = pyLd.match("<body>(.*?)<\/body>")[0];
            const invoiceDiv = pyLd;
            const invoiceTitle = pyLd.match('<span style="font-weight: bold;font-size: 16px;">(.*?)</span>')[1]
            const code = invoiceTitle.substring(0, 5);
            const type = pyLd.includes('Bill to sender') ? 'sender' : 'recipient';
            shipmentsData.get(invoiceTitle)['invoiceFile'] = invoiceDiv.trim();
            shipmentsData.get(invoiceTitle)['type'] = type.trim();
            return pyLd;
        }

        return '';
    }

    function searchCustomer_Response(rspObj) {
        searchRequestCount = searchRequestCount + 1;
        if (rspObj.status != 200) {
            reportAJAX_Error (rspObj);
            return;
        }
        var pyLd = rspObj.response.data;
        if (pyLd.length > 0) {
            const item = pyLd[0];
            const code = item[0];
            const email = item[2];

            let keys =[ ...shipmentsData.keys() ];
            keys.forEach((key) => {
                if (key.includes(code)) {
                    shipmentsData.get(key)['email'] = email.trim();
                }
            })
            if (searchRequestCount === count) {
                console.log(shipmentsData);
                $('#copy-remote-customer-emails').removeClass('disabled');
                $('#copy-remote-customer-emails').html('Copy Remote Customers Data');
            }
            return shipmentsData;
        }

        return '';
    }



    function reportAJAX_Error (rspObj) {
        console.error (`TM scrpt => Error ${rspObj.status}!  ${rspObj.statusText}`);
    }
})();