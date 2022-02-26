
function Validator(options) {

    getParent = function(element, classwantchoose) {
        while (element.parentElement) {
            if (element.parentElement.matches(classwantchoose))
            {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorrRule = {};

    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage;
        // console.log(selectorrRule)
        // console.log(rule.selector)
        var rules = selectorrRule[rule.selector]

        // Lặp qua từng rule kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; i++) {
            switch(inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }   

            if(errorMessage) {
                break;
            }
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid');
        }
        else {
            errorElement.innerText = '';
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage
    }

    // Lấy Element của form cần validate
    var formElement = document.querySelector(options.form);

    if (formElement) {
        // Khi submit form  
        formElement.onsubmit = function(e) {

            var isFormValid = true;

            e.preventDefault();
            // Thực hiện lặp qua từng rule và validate luôn
            options.rules.forEach((rule) => { 
                var inputElement = document.querySelector(rule.selector)
                var isValid = validate(inputElement, rule);
                if(!isValid) {
                    isFormValid = false;
                }
            })

            if(isFormValid)
            {
               if (typeof options.onsubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                       
                        switch(input.type) {
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = '  '
                                    return values;
                                } 

                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }

                                values[input.name].push(input.value)
                                break;

                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value ;
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default: 
                                values[input.name] = input.value;
                        }

                        return values;
                    }, {});

                    options.onsubmit(formValues)

                }
            }
            
        }

        // Xử lý lặp qua mỗi rule(blur, input..)
        options.rules.forEach((rule) => {   

            // Lưu lại các rule cho mỗi input
            if(Array.isArray(selectorrRule[rule.selector])) {
                selectorrRule[rule.selector].push(rule.test)
            } else {
                selectorrRule[rule.selector] = [rule.test];
            }

            var inputElements = document.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach(function(inputElement) {
                if (inputElement) {

                    // Xử lý trường hợp blur ra khỏi input
                    inputElement.onblur = () => {
                        // value : inputElement.value
                        // test : rule.test
                        validate(inputElement, rule)
                    }
    
                    // Xử lý trường hợp người dùng nhập vào input
                    inputElement.oninput = () => {
                        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
    
                        errorElement.innerText = '';
                        getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
                    }
                }
            })

        })
    }
    
}

// Định nghĩa rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi: trả ra message lỗi
// 2. Khi không có lỗi: ko trả ra cái gì cả (undefine)

Validator.isRequired = (selector, message   ) => {
    return {
        selector : selector,
        test: function(value) {
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    }
}

Validator.isEmail = (selector, message) => {
    return {
        selector : selector,
        test: function(value) {
            var regexValue = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; 
            return regexValue.test(value) ? undefined : message || 'Trường này phải là email';
        }
    }
}

Validator.minLength= (selector, min, message) => {
    return {
        selector : selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
        }
    }
}

Validator.isConfirmation= (selector, getConfirmValue, message) => {
    return {
        selector : selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Gía trị nhập vào không đúng';
        }
    }
}