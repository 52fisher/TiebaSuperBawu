// ==UserScript==
// @name        SuperBawu
// @namespace   http://tieba.baidu.com
// @include     https://tieba.baidu.com/p/*
// @include     http://tieba.baidu.com/p/*
// @include     http://tieba.baidu.com/bawu2/*
// @exclude     http://tieba.baidu.com/bawu2/platform/listBlackUser*
// @exclude     http://tieba.baidu.com/bawu2/platform/listBawuDel*
// @exclude     http://tieba.baidu.com/bawu2/postaudit/*
// @version     1.5
// @description  贴吧吧务功能增强
// @grant       none
// ==/UserScript==
(function($) {
    var block = {
        menber: 0,
        blocked: 0
    };
    var blockAjax = $.Deferred();
    blockAjax.done(function(e) {
        var d = $('#page_message').text(e);
        d.css('marginLeft', -(d.outerWidth() / 2));
        d.animate({
            top: 0
        }, 500).delay(3000).animate({
            top: -39
        }, 500).done(location.reload());
    });

    function blockID(id) {
        $.post('http://tieba.baidu.com/bawu2/platform/addBlack', {
            ie: 'utf-8',
            tbs: PageData.user.tbs,
            user_id: id,
            word: PageData.forum.forum_name
        }).done(function() {
            block.blocked += 1;
            if (block.menber === block.blocked) {
                blockAjax.resolve('操作完成，本次共拉黑' + block.blocked + '人！');
                block.menber = 0;
                block.blocked = 0;
            }
        });
    }
    var superBawu = {
        defense: function() {
            //神兽增强
            $("select[name=banNum]").append('<option value="183">半年</option><option value="366">一年</option>')
            $("select[name=grade],select[name=hourNum]").append('<option>自定义</option>').change(function() {
                if ($(this).find(':selected').text() == '自定义') {
                    var n = prompt('请输入自定义内容');
                    if (n) {
                        $(this).find(':selected').text(n);
                    }
                }
            })
        },
        appeal: function() {
            //申诉处理增强
            $(".j_next_btn.b_next_btn").after('<div class="fish_auto"><a href="javascript:void(0);" class="ui_btn ui_btn_sub_m"><span><em>自动化处理</em></span></a></div><div class="fish_undoauto"><a href="javascript:void(0);" class="ui_btn ui_btn_sub_m"><span><em>取消自动化</em></span></a></div>');
            $('.fish_auto').css({
                'float': 'left',
                'margin-left': '5px',
                'margin-right': '8px'
            });
            $('.fish_undoauto').css({
                'float': 'left',
                'margin-left': '5px',
                'margin-right': '8px'
            });
            $('.fish_auto').click(function() {
                var work = setInterval(function() {
                    var send = $('.j_send_btn.b_send_btn');
                    if (send.length) {
                        send.click()
                        return;
                    }
                    clearInterval(work);
                }, 100)
            });
            $('.fish_undoauto').click(function() {
                clearInterval(work);
            });
        },
        blockAll: function() {
            $('.btn_group').each(function() {
                $(this).parent().prepend('<td><input type="checkbox"></td>');
            }).parents('.member_list_table').append('<tfoot><td colspan="2">\t<input id="check_all" type="checkbox" >全选</td>\t<td class="right_cell" colspan="8">\t<a id="block_all" class="ui_btn ui_btn_s" onclick="return false;"href="#">\t<span><em>选中项加入黑名单</em></span></a></td></tfoot>').find('th:first').before('<th></th>');
            $('#check_all').click(function() {
                if (!$(this).data('all')) {
                    $('input[type=\'checkbox\']').each(function() {
                        $(this).prop('checked', true);
                    })
                    $(this).data('all', 1);
                } else {
                    $('input[type=\'checkbox\']').each(function() {
                        $(this).prop('checked', false);
                    })
                    $(this).data('all', 0);
                }
            })
            $('#block_all').click(function() {
                $('tbody input[type=\'checkbox\']').each(function() {
                    if ($(this).attr('checked') === 'checked') {
                        block.menber += 1;
                        blockID($(this).parents('tr').children('.btn_group').attr('id'));
                    }
                });
            });
            //用户封禁列表
            var bHTML = '<a id="block_check" class="ui_btn ui_btn_s"\tonclick="return false;"href="#">\t<span><em>选中项加入黑名单</em></span></a> ';
            $('#restoreChecked').before(bHTML);
            $('#block_check').click(function() {
                $('#dataTable tbody input[type=\'checkbox\']').each(function() {
                    if ($(this).attr('checked') === 'checked') {
                        block.menber += 1;
                        var userID = $(this).parent().parent().find('.ui_btn').data('user-id');
                        blockID(userID);
                    }
                });
            });
        },
        blackInPosts: function() {
            // add black ID in POSTS
            $('.p_post_ban').each(function() {
                $(this).after('| <a class="p_post_black" href="javascript:void 0;" style="color:inherit"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAAshJREFUSMetVF1Ik1EYfo/ufJvzJkSYkedsGjGdMwSlQkX8mQQREWaBIVQQE1EKk9B+LjKCOaH8QXHawC68kIQRs4narxBSIOlS9PsWoS4rQQWx2mjYThd51oWMb0vP3XnPeZ/zvM973gdBlMtdrykFiI9XHVKNCWZCePx7TqA30Ov15uR8qwLw+SLFQ3IXPBWUKC0mU3ATILjZ0AA61o5ciYnggZfs6cIC5KKT4EcI1pgPndXpkBr1sDOrq1AOJ2IOWq36o96rvypfvIi4wlcMAEChkIrpaeG5zSZdoio8MjT0sZbeEJIMBrn8uTLyBv/IyBAvkyE84HKJN+masNDVxXFlCUhA7wlvu7ulZFog3Fpfn2dapmQ6XbStYgwAACFJTRy4raVFPEKqcFZnp6zUkoFm49dOp2QjnxSm/HzJSMuFfTMzuyUi2okVPxoeFu3aJuViUdHOyq/T47hpbMzTrD0mFKSn87i4SS8ozuXl7ZaIaEyuw08yM6VCWoebR0dDB/xXizXEIRyemgoLsFdEJmmfoHW7Jyf39wCo1SDZtEwwp6VJCWQDbw0OygKU0i+K6txc6TzNEuJmZz0VlCotqakREygltdjrcIh2nVto0+tjmAJ9AANjLBtuw9fYWDmAtGfeA1vdExNsFVzBi2YzQ5DA7jqd0RJh/kAKGBn71wI7sQr66emoJY2yNfydUAv44p+Qz/FeE5k3EQ12G42Smj7EbSMjOwCkd7Rd2V9Swg2Ej89eEeFj+HdfWBgeYNu5uIH8L5GQj2wbmlRD3uPijg7ZRG6Z3LlCzLcllMvn97iS/OFwVixbGXcu1M82ggONjaySJaE+jQYIimGPFxdhAjJBxRgQ5kanUlLQFZTAqldWgmXBOXbHYknvX27d2hgfD4cftbSf7yfXAcTF+eJjHwhmrZbH1T9/Xwv0Li2R+uVWAL8/Urw/3vB6pW7qxXgAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTctMTItMTFUMjI6MTM6MTUrMDg6MDDXEBQZAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE3LTEyLTExVDIyOjEzOjE1KzA4OjAwpk2spQAAAGJ0RVh0c3ZnOmJhc2UtdXJpAGZpbGU6Ly8vaG9tZS9hZG1pbi9pY29uLWZvbnQvdG1wL2ljb25fN3lpN3lodXZucHFyNTI5LyVFOSVCQiU5MSVFNSU5MCU4RCVFNSU4RCU5NS5zdmdiDQ4pAAAAAElFTkSuQmCC">黑</a> |');
            });
            $('a.p_post_black').bind('click', function() {
                var _data = JSON.parse($(this).parents('.j_l_post').attr('data-field'));
                var a = $.dialog.confirm('确认拉黑 ' + _data.author.user_name + ' 吗？');
                a.bind('onaccept', function() {
                    $.ajax({
                        type: 'POST',
                        url: '/bawu2/platform/addBlack',
                        data: {
                            tbs: PageData.tbs,
                            user_id: _data.author.user_id,
                            word: PageData.forum.forum_name,
                            ie: 'utf-8'
                        },
                        dataType: 'json',
                        success: function(e) {
                            $.dialog.assert(e.errno === 0 ? '拉黑成功' : '拉黑失败: ' + e.errmsg);
                        }
                    });
                });
            });
        },
        showName: function() {
            $("a.p_author_name.j_user_card").each(function() {
                $(this).after('<p class="p_author_name" style="color:#333;font-size:12px;">用户名: ' + JSON.parse($(this).attr('data-field')).un + '</p>');
            });
        }
    }
    superBawu.defense();
    superBawu.blockAll();
    superBawu.appeal();
    superBawu.blackInPosts();
    superBawu.showName();
})($);