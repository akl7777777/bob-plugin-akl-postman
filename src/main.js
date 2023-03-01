var config = require('./config.js');
var utils = require('./utils.js');



function supportLanguages() {
    return config.supportedLanguages.map(([standardLang]) => standardLang);
}

function translate(query, completion) {
    (async () => {
        const translate_text = query.text || '';
        if (translate_text !== '') {
            const options = {}
            let cnt = 0
            translate_text.split(/\r?\n/).forEach((line, index) => {
                if (line) {
                    switch (cnt) {
                        case 0:
                            options['url'] = line
                            cnt++
                            break;
                        case 1:
                            options['method'] = line.toUpperCase()
                            cnt++
                            break;
                        case 2:
                            options['header'] = JSON.parse(line)
                            cnt++
                            break;
                        case 3:
                            options['body'] = JSON.parse(line)
                            cnt++
                            break;
                        default:
                            break;
                    }
                }
            })
            try {
                $log.error('**************' + JSON.stringify(options))
                const resp = await $http.request(options);
                const rs = []
                if (resp.data) {
                    rs.push(JSON.stringify(resp.data))
                    completion({
                        result: {
                            from: query.detectFrom,
                            to: query.detectTo,
                            toParagraphs: rs,
                        },
                    });
                } else {
                    const errMsg = resp.data ? JSON.stringify(resp.data) : '未知错误'
                    completion({
                        error: {
                            type: 'unknown',
                            message: errMsg,
                            addtion: errMsg,
                        },
                    });
                }
            } catch (e) {
                Object.assign(e, {
                    _type: 'network',
                    _message: '接口请求错误 - ' + JSON.stringify(e),
                });
                throw e;
            }
        }
    })().catch((err) => {
        completion({
            error: {
                type: err._type || 'unknown',
                message: err._message || '未知错误',
                addtion: err._addtion,
            },
        });
    });
}

exports.supportLanguages = supportLanguages;
exports.translate = translate;
