/*------------------------------------------------------------------------------
 * PMCC v0.1.56 published on Tue Aug 04 2015 22:33:54 GMT-0400 (EDT)
 * Copyright (c) 2015 PubMatic. All Rights Reserved.
 *------------------------------------------------------------------------------*/
/**
 * @ngdoc module
 * @name pmccCore
 * @restrict E
 * @element ANY
 * @priority 1000
 * @transclude
 **/
(function() {

    angular.module("pmcc", [])
        .factory("pmccIndexService", function() {

            var index = 0;

            function getNextIndex() {
                return "pmcc" + (index++);
            }

            return {
                getNextIndex: getNextIndex
            };
        });

})();
/**
 * Created by RoySelig on 4/8/15.
 */

/**
 * @ngdoc module
 * @name pmccCore.LayerService
 * @restrict E
 * @element ANY
 * @priority 1000
 * @transclude
 **/

(function() {

    angular.module("pmcc")
        .factory("pmccServicesUtilities", ['$timeout', '$q', function($timeout, $q) {

            function debounce(func, wait, immediate) {
                var timeout;
                // Create a deferred object that will be resolved when we need to
                // actually call the func
                var deferred = $q.defer();

                return function() {
                    var context = this,
                        args = arguments;
                    var later = function() {
                        timeout = null;
                        if (!immediate) {
                            deferred.resolve(func.apply(context, args));
                            deferred = $q.defer();
                        }
                    };
                    var callNow = immediate && !timeout;
                    if (timeout) {
                        $timeout.cancel(timeout);
                    }
                    timeout = $timeout(later, wait);
                    if (callNow) {
                        deferred.resolve(func.apply(context, args));
                        deferred = $q.defer();
                    }
                    return deferred.promise;
                };
            }

            return {
                debounce: debounce
            };
        }]);

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccAdSize //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccAdSize", function() {
            return {
                restrict: "E",
                scope: {
                    ngModel: '=',
                    screenWidth: '@',
                    screenHeight: '@'
                },
                template: "<div class=\"pmcc-screen\" ng-style=\"{ 'width':getMockWidth(), 'height':getMockHeight() }\">" +
                    "<div class=\"pmcc-screen-inner\">" +
                    "<div class=\"pmcc-ad\"" +
                    "ng-style=\"getMockAdProperties()\"" +
                    "></div>" +
                    "</div>" +
                    "</div>",
                link: function($scope, $element, $attrs) {
                    var mockScale = angular.isDefined($attrs.scale) ? $attrs.scale : 0.15;
                    var getScale = function(val) {
                        return val * mockScale;
                    };

                    if (!angular.isDefined($scope.ngModel)) {
                        $scope.$parent[$attrs.ngModel] = {};
                    }

                    $scope.getMockWidth = function() {
                        return getScale($scope.screenWidth) + "px";
                    };

                    $scope.getMockHeight = function() {
                        return getScale($scope.screenHeight) + "px";
                    };

                    var currentAdWatcher = $scope.$watch('ngModel', function(newVal) {

                        $scope.getMockAdProperties = function() {
                            if (angular.equals({}, $scope.ngModel)) {
                                return;
                            }

                            var posX = $scope.ngModel.position.split('-')[0],
                                posY = $scope.ngModel.position.split('-')[1];

                            switch (posX) {
                                case 'left':
                                    posX = 0;
                                    break;
                                case 'center':
                                    posX = ($scope.screenWidth - $scope.ngModel.width) / 2;
                                    break;
                                case 'right':
                                    posX = $scope.screenWidth - $scope.ngModel.width;
                                    break;
                            }

                            switch (posY) {
                                case 'top':
                                    posY = 0;
                                    break;
                                case 'center':
                                    posY = ($scope.screenHeight - $scope.ngModel.height) / 2;
                                    break;
                                case 'bottom':
                                    posY = $scope.screenHeight - $scope.ngModel.height;
                                    break;
                            }

                            return {
                                width: (getScale($scope.ngModel.width) || 0) + "px",
                                height: (getScale($scope.ngModel.height) || 0) + "px",
                                top: getScale(posY) + "px",
                                left: getScale(posX) + "px"
                            };
                        };
                    }, true);

                    $scope.$on("$destroy", function() {
                        currentAdWatcher();
                    });


                }
            };
        })
        .directive("pmccAdSizeTrigger", function() {
            return {
                restrict: "A",
                scope: false,
                link: function($scope, $element, $attrs) {
                    var startTypes = 'touchstart mouseover',
                        endTypes = 'touchend touchcancel mouseout';

                    var activateAd = function(apply) {
                        $element.parent().attr('active-ad', $scope.$index);
                        $element.addClass('pmcc-ad-active');
                        $scope.$parent[$attrs.pmccAdSizeTrigger] = $scope.ad;

                        if (apply) {
                            $scope.$parent.$apply();
                        }
                    };

                    var deactivateAd = function(apply) {
                        $element.parent().removeAttr('active-ad');
                        $element.removeClass('pmcc-ad-active');
                        $scope.$parent[$attrs.pmccAdSizeTrigger] = {};

                        if (apply) {
                            $scope.$parent.$apply();
                        }
                    };

                    // Set first ad in list as default active ad
                    if ($scope.$index === 0) {
                        var elParent = $element.parent();

                        $scope.$watch(function() {
                            return elParent.attr('active-ad');
                        }, function(newVal) {
                            if (angular.isDefined(newVal) && parseInt(newVal) !== $scope.$index) {
                                $element.removeClass('pmcc-ad-active');
                            } else {
                                activateAd();
                            }
                        });

                        activateAd();
                    }

                    $element.on(startTypes, function() {
                        activateAd(true);
                    });

                    $element.on(endTypes, function() {
                        deactivateAd(true, true);
                    });

                    $scope.$on("$destroy", function() {
                        $element.unbind(startTypes, endTypes);
                    });
                }
            };
        });

})();

(function() {


    angular.module("pmcc")

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccBtnGroup //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     * TODO: Should the component allow multiple active options?
     * TODO: Vertical button group? See Bootstrap.
     **/
    .directive("pmccBtnGroup", function() {
            return {
                restrict: 'E',
                require: "ngModel",
                transclude: true,
                scope: {
                    ngModel: '='
                },
                template: "<div class='clearfix' ng-transclude></div>",
                controller: ["$scope", "$element", function($scope, $element) {
                    var vm = this;
                    $scope.items = [];
                    $scope.selectDefault = function() {
                        vm.selectItem({
                            value: $scope.ngModel
                        });
                    };

                    this.addItem = function(item) {
                        $scope.items.push(item);
                    };

                    this.selectItem = function(item) {
                        for (var i = 0; i < $scope.items.length; i++) {
                            if (item.value != $scope.items[i].value) {
                                $scope.items[i].selected = false;
                            } else {
                                $scope.items[i].selected = true;
                                $scope.ngModel = $scope.items[i].value;
                            }
                        }
                    };
                }],
                link: {
                    post: function(scope) {
                        scope.selectDefault();
                    }
                }
            };
        })
        /**
         * @ngdoc directive // Mark the object as a directive
         * @name pmcc.pmccBtnGroupItem //start with the module name. the second part is always directive. the directive name goes after the the column
         * @restrict E //the elements the directive is restricted to.
         * @element ANY //will create a usage example combined with restrict
         * @priority 1000 //The higher the priority the sooner the directive gets compiled.
         * //@scope  //add this attribute if you create a scope in your directive.
         **/
        .directive('pmccBtnGroupItem', function() {
            return {
                restrict: "E",
                require: "^pmccBtnGroup",
                transclude: true,
                scope: {
                    value: '@value'
                },
                template: "<div class='pmcc-btn-group-item' ng-class='{\"pmcc-btn-group-item-selected\":selected}' ng-click='selectItem()' ng-transclude></div>",
                link: function(scope, element, attrs, btnGroup) {
                    scope.selected = attrs.selected || attrs.selected === true;
                    scope.value = attrs.value;
                    btnGroup.addItem(scope);

                    scope.selectItem = function() {
                        btnGroup.selectItem(scope);
                    };
                }
            };
        });

})();

(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccBtnMenu //start with the module name. the second part is always directive. the directive name
     *     goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccBtnMenu", ["$timeout", function($timeout) {

            var keys = {
                up: 40,
                down: 38,
                enter: 13
            };

            return {
                transclude: true,
                restrict: "E",
                template: '<span class="button" ng-class="{\'disabled\':disabled}">' +
                    '<span class="button-wrapper"">' +
                    '<button class="pmcc-menu-control" ng-class="cssClass" ng-disabled="disabled" ng-click="handleClick($event)" ng-focus="handleFocus($event)" ng-blur="handleBlur($event)" ng-keydown="menuKeyHandler($event)"><span ng-transclude></span></button>' +
                    '</span>' +
                    '<pmcc-services-menu is-open="isMenuOpenCtrl" model="model" items="options" key-handler="menuKeyHandler"></pmcc-services-menu>' +
                    '</span>',
                scope: {
                    model: "=",
                    options: "=",
                    cssClass: "@",
                    disabled: "="
                },
                link: function(scope, element, attrs) {

                    scope.isMenuOpenCtrl = false;
                    scope.menuKeyHandler = angular.noop();

                    scope.handleClick = function(e) {
                        $timeout(function() {
                            if (scope.isMenuOpenCtrl === false) {
                                scope.isMenuOpenCtrl = true;
                                element.find("button")[0].focus();
                            }
                        }, 250);

                    };

                    scope.handleBlur = function(e) {
                        scope.isMenuOpenCtrl = false;
                    };

                    scope.handleFocus = function(e) {
                        scope.isMenuOpenCtrl = true;
                    };
                }
            };
        }]);

})();

(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccBtnToggle //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     * TODO: Should this just be an attribute that is tied to pmcc-buttons? Though the styles conflict.
     **/

    angular.module("pmcc")
        .directive("pmccBtnToggle", function() {
            return {
                restrict: "E",
                require: "ngModel",
                link: function(scope, element, attrs, ngModel) {
                    scope.$watch(function() {
                        return ngModel.$modelValue;
                    }, function(modelValue) {
                        if (modelValue) {
                            element.addClass("active");
                        } else {
                            element.removeClass("active");
                        }
                    });

                    element.bind("click", function() {
                        scope.$apply(function() {
                            ngModel.$setViewValue(element.hasClass("active") ? false : true);
                        });
                    });

                    scope.$on("$destroy", function() {
                        element.unbind('click');
                    });
                }
            };
        });

})();

(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccButtons //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccButtons", function() {
            return {
                restrict: "E",
                transclude: true,
                template: "<ng-transclude></ng-transclude>",
                link: function(scope, element, attrs) {
                    if (attrs.size) {
                        element.css({
                            'width': attrs.size + "px",
                            'height': attrs.size + "px",
                            'border-radius': attrs.size + "px"
                        });
                    }
                }
            };
        });

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccDayofweek //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccDayofweek", function() {
            return {
                restrict: "E",
                template: '<ul class="pmcc-dayofweek">' +
                    '<li ng-repeat="day in dow" ng-class="{\'selected\':day.selected}">{{::day.label}}</li>' +
                    '</ul>',
                scope: {
                    dow: "=model"
                },
                link: function(scope, element, attrs) {}
            };
        });

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccDialog //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .factory("pmccServicesDialogManager", ["$timeout", "pmccServicesLayer", pmccServicesDialogManager])
        .directive("pmccDialog", ["pmccServicesDialogManager", "$q", pmccDialog]);

    function pmccServicesDialogManager($timeout, pmccServicesLayer) {

        var dialogs = {};

        function add(id, dialog) {
            dialogs[id] = dialog;
        }

        function remove(id) {
            delete dialogs[id];
        }

        function show(id) {

            var d = dialogs[id];

            if (d) {

                d.visible = true;

                $timeout(function() {
                    position(d);
                }, 0);

            }
        }

        function position(d) {

            var b = pmccServicesLayer.getViewportBounds(),
                w = width(d.dialogLayer),
                h = height(d.dialogLayer),
                x = b.left + ((b.right - b.left) - w) * 0.5,
                y = b.top + ((b.bottom - b.top) - h) * 0.5;

            x = Math.max(b.left, x);
            y = Math.max(b.top, y);

            d.dialogLayer.css("z-index", pmccServicesLayer.getNextLayer());
            d.dialogLayer.css("left", x + "px");
            d.dialogLayer.css("top", y + "px");

        }

        function hide(id) {

            var d = dialogs[id];

            if (d) {
                // d.$apply( function () {

                d.dialogLayer.css("top", "-10000px");
                d.visible = false;

                //} );
            }
        }

        function width(dialog) {
            return dialog.prop("offsetWidth");
        }

        function height(dialog) {
            return dialog.prop("offsetHeight");
        }

        function left(dialog) {
            return dialog.prop("offsetLeft");
        }

        function top(dialog) {
            return dialog.prop("offsetTop");
        }

        function constrainMovementToViewport(dialogLayer) {

            var b = pmccServicesLayer.getViewportBounds(),
                w = width(dialogLayer),
                h = height(dialogLayer),
                offscreenAllowance = 0.75;

            return {
                x: {
                    min: function() {
                        return -w * offscreenAllowance;
                    },
                    max: function() {
                        return b.right - w * (1 - offscreenAllowance);
                    }
                },
                y: {
                    min: function() {
                        return 0;
                    },
                    max: function() {
                        return b.bottom - h * (1 - offscreenAllowance);
                    }
                },
                callback: function() {}
            };
        }

        return {

            add: add,
            remove: remove,
            show: show,
            hide: hide,
            constrainMovementToViewport: constrainMovementToViewport
        };
    }

    function pmccDialog(pmccServicesDialogManager, $q) {

        return {
            restrict: "E",
            transclude: true,
            scope: true,
            template: template,
            link: link
        };

        function template(element, attrs) {

            var klass = attrs.size || "medium ",
                header = "";

            switch (attrs.type) {
                case "modal":
                    klass += " pmcc-modal-dialog pmcc-dialog-layer";
                    break;
                case "non-modal":
                    klass += " pmcc-non-modal-dialog pmcc-dialog-layer";
                    break;
            }

            return "<div pmcc-services-draggable='constrain()' " +
                "pmcc-services-draggable-handle='.pmcc-dialog-header' " +
                "ng-show='isVisible()' class='" + klass + "'>" +
                "<ng-transclude></ng-transclude>" +
                "</div>";
        }

        function link(scope, element, attrs) {

            if (!attrs.id) {

                console.log("pmcc-dialog: dialog Id is a required attribute but is not defined");
                return;
            }

            scope.dialogLayer = angular.element(element[0].querySelector(".pmcc-dialog-layer"));
            scope.visible = false;
            scope.isVisible = function() {
                return scope.visible;
            };

            //register dialog
            var id = attrs.id;
            pmccServicesDialogManager.add(id, scope);

            switch (attrs.type) {
                case "modal":
                    break;
                case "non-modal":
                    scope.title = attrs.title;
                    scope.constrain = function() {
                        return pmccServicesDialogManager.constrainMovementToViewport(scope.dialogLayer);
                    };
                    break;

            }

            //attach dismiss method
            var dismissButtons = scope.dialogLayer[0].querySelectorAll(".pmcc-dismiss");
            var cancelButtons = scope.dialogLayer[0].querySelectorAll(".pmcc-cancel");

            var dismiss = function() {

                if (attrs.closeCallback) {

                    var promise = scope.$eval(attrs.closeCallback);

                    $q.when(promise).then(
                        function(result) {

                            if (result) {
                                pmccServicesDialogManager.hide(id);
                            }

                        }

                    );



                } else {
                    pmccServicesDialogManager.hide(id);
                }

            };

            var cancel = function() {
                pmccServicesDialogManager.hide(id);
            };


            for (var i = 0; i < dismissButtons.length; i++) {

                angular.element(dismissButtons[i]).on("click", dismiss);

            }

            for (var j = 0; j < cancelButtons.length; j++) {

                angular.element(cancelButtons[j]).on("click", cancel);

            }

            scope.$on("$destroy", function() {
                for (var i = 0; i < dismissButtons.length; i++) {

                    angular.element(dismissButtons[i]).off("click");

                }

                for (var j = 0; j < cancelButtons.length; j++) {

                    angular.element(cancelButtons[j]).on("click", cancel);

                }

            });
        }

    }

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccDropdown //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccDropdown", ["$timeout", function($timeout) {

            var keys = {
                up: 40,
                down: 38,
                enter: 13
            };

            return {
                restrict: "E",
                template: '<span class="select" ng-class="{\'disabled\':disabled}">' +
                    '<span class="input-wrapper">' +
                    '<span ng-if="model.icon" ng-class="model.icon"></span>' +
                    '<input class="pmcc-menu-control" ng-style="{ \'width\': {{::width}} + \'px\' }" ng-disabled="disabled" ng-model="model.label" ng-click="handleClick($event)" ng-focus="isMenuOpenCtrl = true" ng-blur="isMenuOpenCtrl = false" readonly ng-keydown="menuKeyHandler($event)">' +
                    '</span>' +
                    '<pmcc-services-menu is-open="isMenuOpenCtrl" model="model" items="options" key-handler="menuKeyHandler"></pmcc-services-menu>' +
                    '</span>',
                scope: {
                    model: "=",
                    options: "=",
                    onChange: "&",
                    disabled: "=",
                    width: "@"
                },
                link: function(scope, element) {



                    scope.isMenuOpenCtrl = false;
                    scope.menuKeyHandler = angular.noop();

                    scope.handleClick = function(event) {
                        $timeout(function() {
                            if (scope.isMenuOpenCtrl === false) {
                                scope.isMenuOpenCtrl = true;
                                element.find("input")[0].focus();
                            }
                        }, 250);
                    };

                    var modelChange = scope.$watch("model", function(newValue) {
                        if (scope.onChange) {
                            scope.onChange({
                                value: newValue
                            });
                        }

                        return newValue;
                    });

                    scope.$on("$destroy", function() {
                        modelChange();
                    });
                }

            };

        }]);

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccDynaPagePanel //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccDynaPagePanel", function() {
            return {
                restrict: "E",
                transclude: true,
                template: "<ng-transclude></ng-transclude>",
                link: function(scope, element, attrs) {



                    /*if you add watchers to your scope,
                     * or make use of async stuff like $timeout
                     * don't forget to destroy them
                     *
                     * scope.$on("$destroy", function(){
                     *
                     * });
                     * */


                }
            };
        });

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccInfiniteScroll //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict A //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     **/

    angular.module("pmcc")
        .directive("pmccInfiniteScroll", function() {
            return {
                restrict: "A",
                link: function(scope, element, attrs) {

                    var raw = element[0];

                    element.bind('scroll', function() {
                        if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                            scope.$apply(attrs.pmccInfiniteScroll);
                        }
                    });

                }
            };
        });

})();

(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccInput //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccInput", function() {
            return {
                restrict: "E",
                transclude: true,
                template: "<ng-transclude></ng-transclude>",
                link: function(scope, element, attrs) {



                    /*if you add watchers to your scope,
                     * or make use of async stuff like $timeout
                     * don't forget to destroy them
                     *
                     * scope.$on("$destroy", function(){
                     *
                     * });
                     * */


                }
            };
        });

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccMultiselect //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     * TODO: Discuss using psuedo element for input clearing - semantic? Look into psuedo element binding â€“ look at andrew's button menu test
     * TODO: selectionSummation string
     * TODO: Reduce scope usage
     **/

    angular.module("pmcc")
        .factory('pmccMultiselectMessaging', function() {
            var NO_RESULTS_FOUND = "Sorry, we couldn't find any results. Please modify your search criteria and try again.";
            var RESULTS_LIMIT_EXCEEDED = "{{ numRecordsFoundCommaSeparated }} results found. To refine results, please modify your search criteria.";
            var TRIGGER_LABEL = function(selectedItems, availableItemsLength, labelProp, defaultLabel) {
                var triggerLabel,
                    selectedItemsLength = selectedItems.length;

                if (selectedItemsLength === 0) {
                    if (angular.isDefined(defaultLabel)) {
                        triggerLabel = defaultLabel;
                    } else {
                        triggerLabel = 'Select';
                    }
                } else if (selectedItemsLength === 1) {
                    triggerLabel = selectedItems[0][labelProp];
                } else if (selectedItemsLength === availableItemsLength) {
                    triggerLabel = 'All';
                } else {
                    triggerLabel = 'Multiple';
                }

                return triggerLabel;
            };

            return {
                NO_RESULTS_FOUND: NO_RESULTS_FOUND,
                RESULTS_LIMIT_EXCEEDED: RESULTS_LIMIT_EXCEEDED,
                TRIGGER_LABEL: TRIGGER_LABEL
            };
        })
        .directive("pmccMultiselect", ["$document", "$filter", "$interpolate", "$timeout", "pmccMultiselectMessaging", function($document, $filter, $interpolate, $timeout, pmccMultiselectMessaging) {

            var trigger = '<pmcc-ms-trigger ng-class="{\'active\': open, \'right\': alignRight}"' +
                'ng-click="toggleLayer()">{{ triggerLabel }}</pmcc-ms-trigger>';

            var availableSectionHeader = '<div class="pmcc-ms-section-header">' +
                '<button type="button" class="pmcc-btn-sm pmcc-secondary"' +
                'ng-if="settings.selectedItemsLimit === 0"' +
                'ng-class="{\'disabled\': availableItems.length === selectedItemsSoftStore.length || allVisibleItemsSelected}"' +
                'ng-click="selectAll()">Select All</button>' +
                '<div ng-if="settings.selectedItemsLimit > 0">Select up to {{ settings.selectedItemsLimit }} items</div>' +
                '<div class="instructions-spacer" ng-if="instructions"></div>' +
                '</div>';

            var availableSectionSearch = '<div class="pmcc-input-search">' +
                '<span class="label">Search: </span>' +
                '<input type="text"' +
                'ng-model="availableItemsSearchQuery"' +
                'ng-model-options="{ debounce: {\'default\': 400, \'blur\': 0} }"' +
                'ng-change="searchAvailableItems()"' +
                'pmcc-set-focus="open"/>' +
                '<span class="pmcc-ico-close"' +
                'ng-show="!availableItemsSearchEmpty"' +
                'ng-click="clearAvailableItemsSearch()">' +
                '</span>' +
                '</div>';

            var availableSectionList = '<ul class="pmcc-available-list" pmcc-infinite-scroll="loadAvailableItems()">' +
                '<li class="messaging" ng-if="!viewableAvailableItems.length || settings.searchCallbackEnabled && !availableItemsSearchEmpty && !numRecordsFound">{{ ::noMatchesMessage }}</li>' +
                '<li ng-repeat="availableItem in viewableAvailableItems" ' +
                'ng-class="{\'selected\': isSelected(availableItem[settings.idProp])}">' +
                '<a href="" ng-click="selectItem(availableItem)">{{ availableItem[settings.labelProp] }}</a>' +
                '</li>' +
                '<li class="messaging" ng-if="settings.searchCallbackEnabled && maxNumRecordsExceeded">{{ matchesExceedsLimitMessageInterpolated }}</li>' +
                '</ul>';


            var selectedSectionHeader = '<div class="pmcc-ms-section-header">' +
                '<button type="button" class="pmcc-btn-sm pmcc-secondary"' +
                'ng-class="{\'disabled\': selectedItemsStore.length === 0}"' +
                'ng-click="deselectAll()">Clear All</button>' +
                '<div ng-if="instructions"><strong>{{ instructions }}:</strong></div>' +
                '</div>';

            var selectedSectionSearch = '<div class="pmcc-input-search"' +
                'ng-class="{\'disabled\': !selectedItemsSearchEnabled}"' +
                'ng-hide="!selectedItemsSearchEnabled">' +
                '<span class="label">Search: </span>' +
                '<input type="text"' +
                'ng-model="selectedItemsSearchQuery"' +
                'ng-model-options="{ debounce: {\'default\': 400, \'blur\': 0} }"' +
                'ng-change="searchSelectedItems()"/>' +
                '<span class="pmcc-ico-close"' +
                'ng-show="!selectedItemsSearchEmpty"' +
                'ng-click="clearSelectedItemsSearch()">' +
                '</span>' +
                '</div>';

            var selectedSectionList = '<ul class="pmcc-selected-list" pmcc-infinite-scroll="loadSelectedItems()">' +
                '<li ng-repeat="selectedItem in viewableSelectedItems">' +
                '<a href="" ng-click="selectItem(selectedItem)">{{ selectedItem[settings.labelProp] }}</a>' +
                '</li>' +
                '</ul>';

            var availableSection = '<div class="pmcc-available-section">' +
                availableSectionHeader +
                availableSectionSearch +
                availableSectionList +
                '</div>';

            var selectedSection = '<div class="pmcc-selected-section">' +
                selectedSectionHeader +
                selectedSectionSearch +
                selectedSectionList +
                '</div>';

            var buttonBar = '<div class="pmcc-button-bar">' +
                '<left>' +
                '<button type="button" class="pmcc-btn-lg pmcc-secondary" ng-click="closeLayer(\'cancel\')">Cancel</button>' +
                '</left>' +
                '<right class="pmcc-right">' +
                '<button type="button" class="pmcc-btn-lg pmcc-primary" ng-click="closeLayer(\'close\')">Done</button>' +
                '</right>' +
                '</div>';

            var template = '<div class="pmcc-ms-container" ng-class="{\'disabled\': disabled}">' +
                trigger +
                '<pmcc-ms-layer ng-class="{\'active\': open, \'right\': alignRight, \'layer-push\': settings.layerPositioning}"' +
                'ng-style="{display: open ? \'block\' : \'none\'}">' +
                '<div class="pmcc-group">' +
                availableSection +
                selectedSection +
                buttonBar +
                '</div>' +
                '</pmcc-ms-layer>' +
                '</div>';

            return {
                restrict: "E",
                template: template,
                scope: {
                    disabled: '=?',
                    availableItems: '=',
                    selectedItems: '=',
                    instructions: '@?',
                    doneCallback: '=',
                    cancelCallback: '=',
                    searchCallback: '&?',
                    maxNumRecordsReturned: '@?',
                    numRecordsFound: '=?',
                    noMatchesMessage: '=?',
                    matchesExceedsLimitMessage: '@?',
                    msSettings: '=',
                    defaultLabel: '@?'
                },
                link: function($scope, $elem, $attrs) {
                    var multiselectId = null;
                    var availableItemsStoreIndex = 0;
                    var selectedItemsStoreIndex = 0;
                    var numRecordsFoundWatcher;
                    var mutableSettings = {
                        idProp: 'id',
                        labelProp: 'name',
                        selectedItemsLimit: 0,
                        maxViewableAvailableItems: 5,
                        maxViewableSelectedItems: 6,
                        searchCallbackEnabled: false
                    };
                    mutableSettings = angular.extend(mutableSettings, $scope.msSettings);
                    var permanentSettings = {
                        layerPositioning: mutableSettings.layerPositioning === 'push' // push | overlay
                    };
                    $scope.settings = angular.extend(mutableSettings, permanentSettings);

                    $scope.disabled = angular.isDefined($scope.disabled) ? $scope.disabled : false;
                    $scope.availableItemsSearchEmpty = true;
                    $scope.selectedItemsSearchEmpty = true;
                    $scope.availableItemsSearchQuery = '';
                    $scope.selectedItemsSearchQuery = '';
                    $scope.availableItemsStore = $scope.availableItems;
                    $scope.selectedItemsStore = $scope.selectedItems;
                    $scope.selectedItemsSoftStore = [];
                    $scope.triggerLabel = '';

                    $scope.eventEmitters = {
                        onItemDeselect: angular.noop,
                        onItemSelect: angular.noop,
                        onMultiselectCancel: $scope.cancelCallback ? $scope.cancelCallback : angular.noop,
                        onMultiselectDone: $scope.doneCallback ? $scope.doneCallback : angular.noop
                    };

                    // Component feature checks
                    $scope.instructionsVisible = $scope.instructions && $scope.settings.selectedItemsLimit > 0;
                    $scope.selectedItemsSearchEnabled = $scope.selectedItemsSoftStore.length >= $scope.settings.maxViewableSelectedItems;
                    $scope.alignRight = $scope.settings.align === 'right';

                    if (angular.isDefined($attrs.searchCallback)) {
                        $scope.settings.searchCallbackEnabled = true;

                        if (!angular.isDefined($attrs.numRecordsFound)) {
                            $timeout(function() {
                                if (!angular.isDefined($scope.matchesExceedsLimitMessage)) {
                                    $scope.matchesExceedsLimitMessage = pmccMultiselectMessaging.RESULTS_LIMIT_EXCEEDED;
                                }

                                numRecordsFoundWatcher = $scope.$watch('numRecordsFound', function() {
                                    $scope.numRecordsFound = angular.isDefined($scope.numRecordsFound) ? $scope.numRecordsFound : 0;
                                    $scope.maxNumRecordsExceeded = $scope.maxNumRecordsReturned < $scope.numRecordsFound;
                                    $scope.numRecordsFoundCommaSeparated = commaSeparate($scope.numRecordsFound);
                                    $scope.matchesExceedsLimitMessageInterpolated = $interpolate($scope.matchesExceedsLimitMessage)($scope);
                                });
                            });
                        }
                    }

                    if (!angular.isDefined($scope.noMatchesMessage)) {
                        $scope.noMatchesMessage = pmccMultiselectMessaging.NO_RESULTS_FOUND;
                    }

                    var availableItemsWatcher = $scope.$watch('availableItems', function(newData) {
                        resetAvailableItemsStore(newData);

                        if (!angular.isDefined($attrs.numRecordsFound)) {
                            $scope.numRecordsFound = $scope.availableItems.length;
                        }
                    });

                    var selectedItemsWatcher = $scope.$watch('selectedItemsSoftStore', function(newData) {
                        resetSelectedItemsStore(newData);
                        $scope.selectedItemsSearchEnabled = $scope.selectedItemsSoftStore.length >= $scope.settings.maxViewableSelectedItems;
                    }, true);

                    function updateTriggerLabel() {
                        $scope.triggerLabel = pmccMultiselectMessaging.TRIGGER_LABEL(
                            $scope.selectedItems,
                            $scope.availableItems.length,
                            $scope.settings.labelProp,
                            $attrs.defaultLabel
                        );
                    }
                    updateTriggerLabel();

                    $scope.toggleLayer = function() {
                        if ($scope.disabled) {
                            return false;
                        }
                        $scope.open = !$scope.open;

                        if ($scope.open) {
                            $elem.bind('click', function() {
                                multiselectId = $scope.$id;
                            });
                            $scope.selectedItemsSoftStore = angular.copy($scope.selectedItems);
                            $document.bind('click', $scope.closeLayerHandler);
                        } else {
                            $document.unbind('click', $scope.closeLayerHandler);
                        }
                    };

                    $scope.closeLayer = function(param) {
                        if (param === 'close') {
                            $scope.selectedItems = $scope.selectedItemsSoftStore;
                            $scope.eventEmitters.onMultiselectDone($scope.selectedItems);
                        } else {
                            resetSelectedItemsStore($scope.selectedItems);
                            $scope.eventEmitters.onMultiselectCancel($scope.selectedItems);
                        }

                        updateTriggerLabel();
                        $scope.open = false;
                        $document.unbind('click', $scope.closeLayerHandler);
                    };

                    $scope.closeLayerHandler = function() {
                        if (multiselectId !== $scope.$id) {
                            $scope.$apply($scope.closeLayer);
                        }
                        multiselectId = null;
                    };

                    function findSelectedItemIndex(id) {
                        var filter = $filter('filter')($scope.selectedItemsSoftStore, function(item) {
                            return item.id === id;
                        });

                        return $scope.selectedItemsSoftStore.indexOf(filter[0]);
                    }

                    $scope.isSelected = function(id) {
                        var index = findSelectedItemIndex(id);

                        return index > -1;
                    };

                    function checkAvailabilityItemVisibility() {
                        var allItemsSelected = true;

                        angular.forEach($scope.viewableAvailableItems, function(item) {
                            if (!$scope.isSelected(item[$scope.settings.idProp])) {
                                allItemsSelected = false;
                            }
                        });

                        $scope.allVisibleItemsSelected = allItemsSelected;
                    }

                    $scope.selectItem = function(obj, remove) {
                        var itemId = obj[$scope.settings.idProp];
                        var exists = $scope.isSelected(itemId);
                        remove = remove || false;

                        if (!remove && exists) {
                            $scope.selectedItemsSoftStore.splice(findSelectedItemIndex(itemId), 1);
                            $scope.eventEmitters.onItemDeselect(obj);
                        } else if (!exists && $scope.settings.selectedItemsLimit === 0 || $scope.selectedItemsSoftStore.length < $scope.settings.selectedItemsLimit) {
                            var selectedList = $elem[0].getElementsByClassName('pmcc-selected-list')[0];

                            $scope.selectedItemsSoftStore.push(obj);
                            $scope.eventEmitters.onItemSelect(obj);
                            selectedList.scrollTop = selectedList.scrollHeight;
                        }
                    };

                    $scope.selectAll = function() {
                        angular.forEach($scope.viewableAvailableItems, function(item) {
                            $scope.selectItem(item, true);
                        });

                        checkAvailabilityItemVisibility();
                    };

                    $scope.deselectAll = function() {
                        $scope.selectedItemsSoftStore.splice(0, $scope.selectedItemsSoftStore.length);
                    };

                    $scope.searchAvailableItems = function() {
                        if ($scope.availableItemsSearchQuery) {
                            if ($scope.settings.searchCallbackEnabled) {
                                performSearch($scope.availableItemsSearchQuery);
                            } else {
                                var filterExp = {};
                                filterExp[$scope.settings.labelProp] = $scope.availableItemsSearchQuery;

                                var data = $filter('filter')($scope.availableItems, filterExp);
                                resetAvailableItemsStore(data);
                                $scope.availableItemsSearchEmpty = false;
                            }
                        }

                        if ($scope.availableItemsSearchQuery === '') {
                            if ($scope.settings.searchCallbackEnabled) {
                                performSearch($scope.availableItemsSearchQuery);
                            } else {
                                resetAvailableItemsStore($scope.availableItems);
                                $scope.availableItemsSearchEmpty = true;
                            }
                        }

                        checkAvailabilityItemVisibility();
                    };

                    function resetAvailableItemsStore(data) {
                        $scope.availableItemsStore = data;
                        availableItemsStoreIndex = 0;
                        $scope.viewableAvailableItems = [];
                        loadAvailableItems(100);
                    }

                    function loadAvailableItems(step) {
                        step = step || 20;
                        for (var i = 0; i < step; i++) {
                            if ($scope.availableItemsStore[availableItemsStoreIndex]) {
                                $scope.viewableAvailableItems.push($scope.availableItemsStore[availableItemsStoreIndex]);
                                availableItemsStoreIndex++;
                            }
                        }
                    }

                    $scope.viewableAvailableItems = [];
                    $scope.loadAvailableItems = loadAvailableItems;
                    loadAvailableItems(100);

                    $scope.searchSelectedItems = function() {
                        if ($scope.selectedItemsSearchQuery) {
                            var filterExp = {};
                            filterExp[$scope.settings.labelProp] = $scope.selectedItemsSearchQuery;

                            var data = $filter('filter')($scope.selectedItemsSoftStore, filterExp);
                            resetSelectedItemsStore(data);
                            $scope.selectedItemsSearchEmpty = false;
                        }

                        if ($scope.selectedItemsSearchQuery === '') {
                            resetSelectedItemsStore($scope.selectedItemsSoftStore);
                            $scope.selectedItemsSearchEmpty = true;
                        }
                    };

                    function resetSelectedItemsStore(data) {
                        $scope.selectedItemsStore = data;
                        selectedItemsStoreIndex = 0;
                        $scope.viewableSelectedItems = [];
                        loadSelectedItems(100);
                    }

                    function loadSelectedItems(step) {
                        step = step || 20;
                        for (var i = 0; i < step; i++) {
                            if ($scope.selectedItemsStore[selectedItemsStoreIndex]) {
                                $scope.viewableSelectedItems.push($scope.selectedItemsStore[selectedItemsStoreIndex]);
                                selectedItemsStoreIndex++;
                            }
                        }
                    }

                    $scope.viewableSelectedItems = [];
                    $scope.loadSelectedItems = loadSelectedItems;
                    loadSelectedItems(100);

                    function performSearch(query) {
                        var promise = $scope.searchCallback({
                            query: query
                        }).then(function(results) {
                            $scope.availableItems = results.data.items;
                            $scope.numRecordsFound = results.data.metaData.totalRecords;

                            $scope.availableItemsSearchEmpty = query === '';
                        }, function() {
                            // Failed
                        });

                        return promise;
                    }

                    $scope.clearAvailableItemsSearch = function() {
                        $scope.availableItemsSearchQuery = '';
                        $scope.searchAvailableItems();
                    };

                    $scope.clearSelectedItemsSearch = function() {
                        $scope.selectedItemsSearchQuery = '';
                        $scope.searchSelectedItems();
                    };

                    function commaSeparate(num) {
                        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    }

                    $scope.$on('$destroy', function() {
                        availableItemsWatcher();
                        selectedItemsWatcher();
                        if ($scope.settings.searchCallbackEnabled) {
                            numRecordsFoundWatcher();
                        }
                    });
                }
            };
        }]);

})();

(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccNlpSearch //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccNlpSearch", function() {
            return {
                restrict: "E",
                transclude: true,
                template: "<ng-transclude></ng-transclude>",
                link: function(scope, element, attrs) {


                    /*if you add watchers to your scope,
                     * or make use of async stuff like $timeout
                     * don't forget to destroy them
                     *
                     * scope.$on("$destroy", function(){
                     *
                     * });
                     * */


                }
            };
        });

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccPagination //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .factory("pmccServicesDataSource", ["$rootScope", "$timeout", "$http", function($rootScope, $timeout, $http) {

            var self = this,
                maxPageSize = 100,
                defaultPageSize = 10,
                defaultPage = 1,
                debounceDelay = 400,
                DataSource = function() {
                    var self = this;
                    self.timeout = null;
                    self.pageSize = defaultPageSize;
                    self.pageCount = 1;
                    self.currentPage = defaultPage;
                    self.objectName = "record";
                    self.url = "http://url";
                    self.previous = previous;
                    self.next = next;
                    self.model = [];
                    self.previousDisabled = previousDisabled;
                    self.nextDisabled = nextDisabled;
                    self.sortAttribute = "";
                    self.sortDirection = "";
                    self.numMatches = 0;
                    self.updating = false;
                    self.sort = function() {
                        return "";
                    };
                    self.filters = function() {
                        return "";
                    };
                    self.destroy = destroy;

                    return self;
                };



            function previous() {
                this.currentPage -= 1;
            }

            function next() {
                this.currentPage += 1;
            }

            function previousDisabled() {
                return this.currentPage <= 1;
            }

            function nextDisabled() {
                return this.currentPage >= this.pageCount;
            }

            function destroy() {
                this.queryInputWatcher();
                this.scope = null;
            }


            function create(scope, url) {
                var ds = new DataSource();
                ds.url = url;
                ds.scope = scope;

                /*watch for changes that should trigger a requery
                 * changes can come from updates to
                 * 1. filters
                 * 2. sorting
                 * 3. pagination
                 * */

                ds.queryInputWatcher =
                    ds.scope.$watch(function() {

                            return ds.pageSize + ds.currentPage + JSON.stringify(ds.sort()) + JSON.stringify(ds.filters());

                        },

                        function() {
                            debounceQuery(ds);
                        }
                    );



                return ds;
            }

            function debounceQuery(ds) {

                if (ds.timeout)
                    $timeout.cancel(ds.timeout);

                ds.timeout = $timeout(function() {
                    triggerQuery(ds);
                }, debounceDelay);

            }

            function triggerQuery(ds) {

                ds.updating = true;

                //enforce numbers & max values
                if (isNaN(ds.pageSize) || ds.pageSize === "") {
                    ds.pageSize = defaultPageSize;
                }
                ds.pageSize = Math.min(ds.pageSize, maxPageSize);

                if (isNaN(ds.currentPage) || ds.currentPage === "") {
                    ds.currentPage = defaultPage;
                }
                ds.currentPage = Math.min(ds.currentPage, ds.pageCount);

                var data = {
                    currentPage: ds.currentPage,
                    pageSize: ds.pageSize,
                    filters: ds.filters()
                };

                $http.post(ds.url, data).success(function(response) {
                    ds.model = response.data;
                    ds.numMatches = response.numMatches;
                    ds.pageCount = response.pageCount;
                    ds.currentPage = response.currentPage;
                    ds.updating = false;
                });

            }

            return {
                create: create
            };

        }])
        .directive("pmccPagination", function() {
            return {
                restrict: "E",
                scope: {
                    "datasource": "="
                },
                template: '' +
                    '<div class="pmcc-toolbar pmcc-pagination">' +
                    '<pmcc-flex>' +
                    '<pmcc-left>' +

                    '<pmcc-group class="pmcc-animator strong pmcc-record-count" ng-class="{\'pmcc-fade\':datasource.updating===true}">' +
                    '<span>' +
                    '{{datasource.numMatches | number}} {{::datasource.objectName}}<span ng-if="datasource.numMatches >' +
                    ' 1">s</span> found' +
                    '</span>' +
                    '</pmcc-group>' +

                    '<pmcc-group>' +
                    '<span>' +
                    'Show ' +
                    '<span class="pmcc-input pmcc-xs pmcc-page-size">' +
                    '<input size="3" ng-model="datasource.pageSize"></span>' +
                    ' per page' +
                    '</span>' +
                    '</pmcc-group>' +

                    '</pmcc-left>' +
                    '<pmcc-right>' +
                    '<pmcc-group>' +
                    '<span>' +
                    'Page' +
                    '&nbsp;' +
                    '<span class="pmcc-input pmcc-xs"><input class="pmcc-current-page" size="2" ng-model="datasource.currentPage"></span>' +
                    '&nbsp;' +
                    'of <span class="pmcc-page-count">{{datasource.pageCount}}</span>' +
                    '</span>' +
                    '</pmcc-group>' +
                    '<pmcc-group>' +
                    '<button class="pmcc-btn-sm pmcc-primary pmcc-previous-page" ng-disabled="datasource.previousDisabled()" ng-click="datasource.previous()">' +
                    '<span class="pmcc-ico-caret-left"></span>' +
                    '</button>' +
                    '<button class="pmcc-btn-sm pmcc-primary pmcc-next-page" ng-disabled="datasource.nextDisabled()" ng-click="datasource.next()">' +
                    '<span class="pmcc-ico-caret-right"></span>' +
                    '</button>' +
                    '</pmcc-group>' +
                    '</pmcc-right>' +
                    '</pmcc-flex>' +
                    '</div>',
                link: function(scope, element, attrs) {



                    /*if you add watchers to your scope,
                     * or make use of async stuff like $timeout
                     * don't forget to destroy them
                     *
                     * scope.$on("$destroy", function(){
                     *
                     * });
                     * */


                }
            };
        });

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccDynaBodyPanel //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccPanelSidebarManager", function() {

            return {
                restrict: "A",
                controller: ["$scope", "$element", "$attrs", pmccPanelSidebarController]
            };


            function pmccPanelSidebarController($scope, $element, $attrs) {

                var ctrl = this,
                    css_collapsed = "pmcc-sidebar-collapsed";


                ctrl.showSidebar = false;

                $element.addClass("pmcc-panel-sidebar-manager pmcc-r-1");

                var watcher =
                    $scope.$watch(function() {
                        return ctrl.showSidebar;
                    }, function(showSidebar) {

                        if (showSidebar) {
                            $element.removeClass(css_collapsed);
                        } else {
                            $element.addClass(css_collapsed);
                        }

                    });

                $scope.$on("destroy", function() {
                    watcher();
                });

            }
        })
        .directive("pmccPanelSidebarSibling", function() {

            return {
                link: function(scope, element, attr) {
                    element.addClass("pmcc-panel-sidebar-sibling");
                }
            };
        })
        .directive("pmccPanelSidebar", function() {
            return {
                restrict: "E",
                require: "^pmccPanelSidebarManager",
                transclude: true,
                template: '<div class="pmcc-panel">' +
                    '<div class="pmcc-header" ng-click="toggle()">' +
                    '<pmcc-flex>' +
                    '<pmcc-left>' +
                    '<pmcc-group>' +
                    '<span class="pmcc-title">Select&nbsp;Filters</span>' +
                    '<span class="pmcc-sidebar-icon pmcc-sidebar-icon-collapsed pmcc-ico-chevron-down"></span>' +
                    '</pmcc-group>' +
                    '</pmcc-left>' +
                    '<pmcc-right>' +
                    '<pmcc-group>' +
                    '<span class="pmcc-sidebar-icon pmcc-sidebar-icon-expanded pmcc-ico-chevron-left"></span>' +
                    '</pmcc-group>' +
                    '</pmcc-right>' +
                    '</pmcc-flex>' +
                    '</div>' +
                    '<div class="pmcc-content">' +
                    '<div ng-transclude></div>' +

                    '</div>' +


                    '</div></div>',
                link: pmccPanelSidebarLink
            };

            function pmccPanelSidebarLink(scope, element, attrs, SidebarManager) {

                element.addClass("pmcc-panel-sidebar");

                element.css({
                    width: attrs.width || "200px"
                });

                SidebarManager.showSidebar = (attrs.expanded && attrs.expanded === "true") ? true : false;

                scope.toggle = function() {
                    SidebarManager.showSidebar = !SidebarManager.showSidebar;


                };
            }
        });

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccToggle //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict A //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccToggle", ["$document", function($document) {
            return {
                restrict: "A",
                link: function(scope, element, attrs) {

                    var collapsed = element.hasClass("collapsed");



                    var toggler = element[0].getElementsByClassName("pmccToggler")[0];
                    var togglee = $document[0].getElementById(attrs.pmccToggle);


                    if (toggler) {
                        toggler.addEventListener("click", function() {

                            if (collapsed) {
                                element.removeClass("collapsed");
                                togglee.classname = togglee.className.replace("hidden", "");
                            } else {
                                element.addClass("collapsed");
                                togglee.classname = togglee.classname + " hidden";
                            }

                            collapsed = !collapsed;

                        });
                    }


                }
            };
        }]);

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccPoleChart //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     *
     **/

    angular.module("pmcc")
        .directive("pmccPoleChart", ["$compile", "$interpolate", function($compile, $interpolate) {
            var headerTemplate = '<div class="pmcc-chart-header">' +
                '<span class="metric-label"' +
                'ng-style="getLabelWidth()">' +
                '<span ng-if="isCondensed">{{::ngModel.title}}: </span>' +
                '&nbsp;</span>' +
                '<span class="metric">' +
                '<pmcc-flex class="rule" style="flex:1 auto"></pmcc-flex>' +
                '<pmcc-flex class="text" style="flex:2 0">' +
                '<div class="pmcc-label" title="{{::ngModel.title}}: {{::ngModel.value}}">' +
                '<span ng-if="!isCondensed">{{::ngModel.title}}: </span><strong>{{::ngModel.value}}</strong></div>' +
                '</pmcc-flex>' +
                '<pmcc-flex class="rule" style="flex:1 auto"></pmcc-flex>' +
                '</span>' +
                '</div>';

            var gaugeTemplate = '<div class="pmcc-chart-row">' +
                '<span class="metric-label"' +
                'ng-style="getLabelWidth()"' +
                'title="{{ngModel.label}}">{{::ngModel.label}}:</span>' +
                '<span class="metric">' +
                '<pmcc-flex ng-repeat="value in ngModel.value"' +
                'class="bar"' +
                'ng-class="getGaugeColor({{$index}})"' +
                'style="flex:{{value.value}}">' +
                '<span class="pmcc-gauge-label" title="{{value.label}} {{value.value}}"><strong>{{value.label}}</strong>&nbsp;{{value.value}}%</span>' +
                '</pmcc-flex>' +
                '<pmcc-flex ng-if="ngModel.value.length === 1"' +
                'style="flex:{{100 - ngModel.value[0].value}}"' +
                'class="bar-gray-1"></pmcc-flex>' +
                '</span>' +
                '</div>';

            return {
                restrict: "E",
                scope: {
                    ngModel: '=?'
                },
                link: function(scope, element, attrs) {
                    if (!angular.isDefined(scope.ngModel)) {
                        scope.ngModel = {
                            labelWidth: attrs.labelWidth
                        };

                        if (angular.isDefined(attrs.title)) {
                            scope.ngModel.title = attrs.title;
                            scope.ngModel.value = attrs.value;
                        } else if (angular.isDefined(attrs.label)) {
                            scope.ngModel.label = attrs.label;
                            scope.ngModel.value = [{
                                value: attrs.value
                            }];
                        }
                    }

                    if (element.hasClass('pmcc-condensed')) {
                        scope.isCondensed = true;
                    }

                    scope.getGaugeColor = function(idx) {
                        return " bar-c" + (1 + idx % 2);
                    };

                    scope.getLabelWidth = function() {
                        var labelWidth = scope.ngModel.labelWidth ? scope.ngModel.labelWidth : '20%';

                        return {
                            'flex-grow': 0,
                            'flex-shrink': 1,
                            'flex-basis': labelWidth
                        };
                    };

                    if (angular.isDefined(scope.ngModel.title)) {
                        element.html(headerTemplate);
                    } else if (angular.isDefined(scope.ngModel.label)) {
                        element.html(gaugeTemplate);
                    }

                    $compile(element.contents())(scope);

                }
            };
        }]);

})();

(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccPopover //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccPopoverControl", ["pmccServicesLayer", "$document", function(pmccServicesLayer, $document) {


            var allPopovers = [],
                $body = $document.find('body').eq(0);

            function hideAll() {
                while (allPopovers.length > 0) {
                    var p = allPopovers.shift();
                    p.visible = false;
                    pmccServicesLayer.hideLayerOffscreen(p.layer);
                }
            }

            function show(popover) {
                hide();
                allPopovers.push(popover);
                pmccServicesLayer.placeLayerNearElement(popover.layer, popover.control);
                $document.one("click", hide);
            }

            function hide() {
                hideAll();
            }


            return {
                restrict: "E",
                transclude: true,
                priority: 10,
                scope: true,
                template: "<span ng-click='handleClick( $event )' ng-transclude></span>",
                controller: ["$scope", "$element", function($scope, $element) {

                    var self = this;
                    self.visible = false;
                    self.control = $element[0];
                    self.layer = null; //from child directive

                    self.register = function(layer) {
                        self.layer = layer;
                        $body.append(layer);

                    };

                    $scope.handleClick = function(event) {

                        self.visible = !self.visible;

                        if (self.layer) {
                            if (self.visible) {
                                show(self);
                            } else {
                                hide();
                            }
                        }

                        event.stopPropagation();

                    };


                    /*if you add watchers to your scope,
                     * or make use of async stuff like $timeout
                     * don't forget to destroy them
                     *
                     * scope.$on("$destroy", function(){
                     *
                     * });
                     * */


                }]
            };
        }])
        .directive("pmccPopover", function() {
            return {
                restrict: "E",
                transclude: true,
                priority: 20,
                require: "^pmccPopoverControl",
                template: "<div ng-click='handlePopoverClick( $event )' class='pmcc-popover' ng-class='{\"pmcc-close-icon-hidden\": hideCloseIcon}'>" +
                    "<div class='arrow-box'>" +
                    "<p>" +
                    "<ng-transclude></ng-transclude>" +
                    "</p>" +
                    "<span class='pmcc-popover-close-icon pmcc-dismiss' ng-if='!hideCloseIcon'></span>" +
                    "</div>" +
                    "</div>",
                link: function(scope, element, attrs, popover) {

                    popover.register(element[0]);

                    scope.hideCloseIcon = false;
                    if (attrs.hideCloseIcon) scope.hideCloseIcon = true;

                    scope.handlePopoverClick = function(event) {

                        if (!angular.element(event.target).hasClass('pmcc-dismiss'))
                            event.stopPropagation();

                    };

                    //don't bubble clicks inside the popover

                    /*if you add watchers to your scope,
                     * or make use of async stuff like $timeout
                     * don't forget to destroy them
                     *
                     * scope.$on("$destroy", function(){
                     *
                     * });
                     * */


                }
            };
        });

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccRangeSelector //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * @scope  //add this attribute if you create a scope in your directive.
     * TODO: Migrate functions to pmcc-services-draggable
     * TODO: Custom-value tick marks (factor of 100)
     * TODO: break out pmccDraggable into its own component
     **/

    angular.module("pmcc")
        .directive("pmccRangeSelector", ["$timeout", pmccRangeSelector])
        .directive("pmccDraggable", ["$document", pmccDraggable]); //

    function pmccRangeSelector($timeout) {

        function left(elm) {
            return Math.floor(elm.prop("offsetLeft") || 0);
        }

        function right(elm) {
            return left(elm) + width(elm);
        }

        function width(elm) {
            return Math.floor(elm.prop("offsetWidth") || 0);
        }

        return {
            restrict: "E",
            replace: true,
            template: "<div class='pmcc-range-selector' " +
                "data-min='{{::range.min}}' " +
                "data-max='{{::range.max}}' >" +
                "<lo pmcc-draggable='constrainLo()'></lo>" +
                "<hi pmcc-draggable='constrainHi()'></hi>" +
                "<ticks>" +
                "<tick ng-repeat='i in ticks track by $index' style='width:{{::tickWidth}}'></tick>" +
                "</ticks>" +
                "<bar></bar>" +
                "<band></band>" +
                "</div>",
            scope: {
                range: "=range",
                numTicks: "@"
            },
            link: link
        };

        function link(scope, element, attr) {

            var self = this,
                lo = element.find("lo").eq(0),
                hi = element.find("hi").eq(0),
                bar = element.find("bar").eq(0),
                band = element.find("band").eq(0),
                barWidth = width(bar),
                containerWidth = width(element),
                controlWidth = width(lo),
                modelUpdateInProgress = false,
                updatePending, //a $timeout promise
                modelUpdateDelay = 250, //ms
                pixelsPerUnit = Math.ceil(barWidth / (scope.range.max - scope.range.min));

            scope.ticks = [];
            if (scope.numTicks) {
                for (var i = 0; i < scope.numTicks - 1; i++) {
                    scope.ticks.push(i);
                }

                scope.tickWidth = (100 / scope.numTicks) - 0.001 + "%";
            }

            scope.updateBand = function() {

                var lowPx = right(lo);
                var highPx = left(hi);

                var width = highPx - lowPx;

                band.css({
                    "left": lowPx + "px",
                    "width": width + "px"
                });

                modelUpdateInProgress = true;
                scope.$apply(
                    scope.updateRangeModel(lowPx - controlWidth, highPx - controlWidth)
                );
                modelUpdateInProgress = false;

            };

            scope.updateRangeModel = function(lowValueInPixels, highValueInPixels) {

                var rangeInPixels = barWidth;
                var rangeInUnits = scope.range.max - scope.range.min;

                //console.log( rangeInPixels )

                var lowAsPercentage = (lowValueInPixels / rangeInPixels);
                var highAsPercentage = (highValueInPixels / rangeInPixels);

                var lowInUnits = lowAsPercentage * rangeInUnits;
                var highInUnits = highAsPercentage * rangeInUnits;

                //console.log( lowAsPercentage, lowInUnits );

                //Todo: expose an attr to allow developers to specify rounding approach per range selector instance
                lowInUnits = Math.round(lowInUnits);
                highInUnits = Math.round(highInUnits);

                scope.range.low = scope.range.min + lowInUnits;
                scope.range.high = scope.range.min + highInUnits;



            };

            scope.enforceSafeValues = function() {

                //ensure low and high are numbers
                if (isNaN(scope.range.low)) {
                    scope.range.low = scope.range.min;
                }

                if (isNaN(scope.range.high)) {
                    scope.range.high = scope.range.max;
                }

                //Todo: expose an attr to allow developers to specify rounding approach per range selector instance
                scope.range.low = Math.round(scope.range.low);
                scope.range.high = Math.round(scope.range.high);

                //enforce min and max values
                scope.range.low = Math.max(scope.range.low, scope.range.min);
                scope.range.high = Math.min(scope.range.high, scope.range.max);

                //ensure low <= high
                scope.range.low = Math.min(scope.range.low, scope.range.high);
                scope.range.high = Math.max(scope.range.low, scope.range.high);





            };

            scope.updateRangeUI = function() {

                if (modelUpdateInProgress === true) return; //we are already processing a model change

                scope.enforceSafeValues();

                var rangeInUnits = scope.range.max - scope.range.min;
                var lowValueInUnits = scope.range.low - scope.range.min;
                var highValueInUnits = scope.range.high - scope.range.min;
                var rangeInPixels = barWidth;
                var lowValueInPixels = Math.floor((lowValueInUnits / rangeInUnits) * rangeInPixels);
                var highValueInPixels = Math.floor((highValueInUnits / rangeInUnits) * rangeInPixels);

                //console.log("lo", scope.range.low, lowValueInPixels, rangeInPixels);
                //console.log("hi", scope.range.high, highValueInPixels);

                //enforce min/max pixel values
                /*
                var loLeft = lowValueInPixels;
                loLeft = Math.max( loLeft, 0 );
                loLeft = ( loLeft / pixelsPerUnit ) * pixelsPerUnit;
                var hiLeft = highValueInPixels;
                hiLeft = ( hiLeft / pixelsPerUnit ) * pixelsPerUnit;
                hiLeft = Math.max( loLeft + controlWidth, hiLeft );
                */
                var loLeft = lowValueInPixels; // + controlWidth;
                var hiLeft = highValueInPixels + controlWidth;

                lo[0].style.left = loLeft + "px";
                hi[0].style.left = hiLeft + "px";
                band[0].style.left = loLeft + "px";
                band[0].style.width = (hiLeft - loLeft) + "px";

            };

            scope.debounceUpdateRangeUI = function() {

                if (updatePending) {
                    $timeout.cancel(updatePending);
                }

                updatePending = $timeout(scope.updateRangeUI, modelUpdateDelay);
            };

            var watchRangeLow =
                scope.$watch("range.low", scope.debounceUpdateRangeUI);

            var watchRangeHigh =
                scope.$watch("range.high", scope.debounceUpdateRangeUI);

            scope.$on("$destroy", function() {
                watchRangeLow();
                watchRangeHigh();
            });


            scope.updateRangeUI();

            scope.constrainLo = function() {
                return {
                    roundPixelsToNearest: pixelsPerUnit,
                    x: {
                        min: function() {
                            return 0;
                        },
                        max: function() {
                            return left(hi) - controlWidth;
                        }
                    },
                    y: {
                        min: function() {
                            return 0;
                        },
                        max: function() {
                            return 0;
                        }
                    },
                    callback: scope.updateBand
                };
            };

            scope.constrainHi = function() {
                return {
                    roundPixelsToNearest: pixelsPerUnit,
                    x: {

                        min: function() {
                            return right(lo);
                        },
                        max: function() {
                            return containerWidth - controlWidth;
                        }
                    },
                    y: {
                        min: function() {
                            return 0;
                        },
                        max: function() {
                            return 0;
                        }
                    },
                    callback: scope.updateBand
                };
            };

        }
    }

    function pmccDraggable($document) {

        var endTypes = 'touchend touchcancel mouseup mouseleave',
            moveTypes = 'touchmove mousemove',
            startTypes = 'touchstart mousedown';

        var normalisePoints = function(event) {
            event = (event.touches) ? event.touches[0] : event;
            return {
                pageX: event.pageX,
                pageY: event.pageY
            };
        };

        return {
            restrict: 'A',
            link: link,
            scope: {
                constrain: "&pmccDraggable"
            }
        };

        function link(scope, element, attrs, controller) {

            var
                elementStartX = 0,
                elementStartY = 0,
                interactionStart = {
                    pageX: 0,
                    pageY: 0
                };

            $document.on(endTypes, function(event) {
                event.preventDefault();
                $document.off(moveTypes, handleMove);

            });

            element.on(startTypes, function(event) {
                event.preventDefault();

                elementStartX = parseInt(element.css('left'));
                elementStartY = parseInt(element.css('top'));
                interactionStart = normalisePoints(event);

                if (isNaN(elementStartX))
                    elementStartX = 0;

                if (isNaN(elementStartY))
                    elementStartY = 0;

                $document.on(moveTypes, handleMove);

            });

            function handleMove(event) {

                event.preventDefault();

                interactionCurrent = normalisePoints(event);

                var x = Math.floor(elementStartX + (interactionCurrent.pageX - interactionStart.pageX));
                var y = Math.floor(elementStartY + (interactionCurrent.pageY - interactionStart.pageY));

                //enforce constraints
                var c = scope.constrain();
                y = Math.min(y, c.y.max());
                y = Math.max(y, c.y.min());
                x = Math.min(x, c.x.max());
                x = Math.max(x, c.x.min());

                //x = Math.round( x / c.roundPixelsToNearest ) / c.roundPixelsToNearest;
                //y = Math.round( y / c.roundPixelsToNearest ) / c.roundPixelsToNearest;

                element.css({
                    left: x + 'px',
                    top: y + 'px'
                });

                c.callback();
            }

        }

    }

})();

(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccServicesDraggable //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccServicesDraggable", ["$document", pmccServicesDraggable]);

    function pmccServicesDraggable($document) {

        var endTypes = 'touchend touchcancel mouseup mouseleave',
            moveTypes = 'touchmove mousemove',
            startTypes = 'touchstart mousedown';

        var normalisePoints = function(event) {
            event = (event.touches) ? event.touches[0] : event;
            return {
                pageX: event.pageX,
                pageY: event.pageY
            };
        };

        return {
            restrict: 'A',
            link: link,
            scope: {
                constrain: "&pmccServicesDraggable",
                handleSelector: "@pmccServicesDraggableHandle"
            }
        };

        function link(scope, element) {

            var self = this,
                elementStartX = 0,
                elementStartY = 0,
                interactionStart = {
                    pageX: 0,
                    pageY: 0
                },
                handle;


            try {
                handle = angular.element(document.querySelector(scope.handleSelector)).eq(0);
            } catch (e) {
                handle = element;
            }



            handle.addClass("pmcc-draggable");

            $document.on(endTypes, function(event) {
                event.preventDefault();
                element.removeClass("pmcc-dragging");
                $document.off(moveTypes, handleMove);

            });

            handle.on(startTypes, function(event) {
                event.preventDefault();

                elementStartX = parseInt(element.prop('offsetLeft'));
                elementStartY = parseInt(element.prop('offsetTop'));
                interactionStart = normalisePoints(event);

                if (isNaN(elementStartX))
                    elementStartX = 0;

                if (isNaN(elementStartY))
                    elementStartY = 0;

                handle.addClass("pmcc-dragging");

                $document.on(moveTypes, handleMove);

            });

            function handleMove(event) {

                event.preventDefault();

                interactionCurrent = normalisePoints(event);

                var x = Math.floor(elementStartX + (interactionCurrent.pageX - interactionStart.pageX));
                var y = Math.floor(elementStartY + (interactionCurrent.pageY - interactionStart.pageY));

                //enforce constraints
                var c = scope.constrain();
                y = Math.min(y, c.y.max());
                y = Math.max(y, c.y.min());
                x = Math.min(x, c.x.max());
                x = Math.max(x, c.x.min());

                //x = Math.round( x / c.roundPixelsToNearest ) / c.roundPixelsToNearest;
                //y = Math.round( y / c.roundPixelsToNearest ) / c.roundPixelsToNearest;

                element.css({
                    left: x + 'px',
                    top: y + 'px'
                });

                c.callback();
            }

        }

    }

})();
/**
 * Created by RoySelig on 4/8/15.
 */

/**
 * @ngdoc module
 * @name pmcc.ServicesLayer
 * @restrict E
 * @element ANY
 * @priority 1000
 * @transclude
 **/

(function() {

    angular.module("pmcc")
        .factory("pmccServicesLayer", ["$document", "$window", "pmccServicesMarkdown", function($document, $window, pmccServicesMarkdown) {

            var index = 30000,
                css = {
                    tooltipLayer: "pmcc-tooltip-layer"
                };

            function getNextLayer() {
                return (index++);
            }

            function getElementLayout(obj) {
                var curleft = 0,
                    curtop = 0,
                    x = 0,
                    y = 0,
                    scrollOffset = getScrollOffset(obj),
                    width = obj.clientWidth,
                    height = obj.clientHeight;

                if (obj.offsetParent) {

                    do {

                        curleft += obj.offsetLeft;
                        curtop += obj.offsetTop;

                        x += (obj.offsetLeft - obj.scrollLeft + obj.clientLeft);
                        y += (obj.offsetTop - obj.scrollTop + obj.clientTop);

                        obj = obj.offsetParent;

                    } while (obj);

                    curleft -= scrollOffset.x;
                    curtop -= scrollOffset.y;

                    return {
                        left: curleft,
                        top: curtop,
                        right: curleft + width,
                        bottom: curtop + height,
                        width: width,
                        height: height,
                        center: curleft + width / 2,
                        x: x - scrollOffset.x,
                        y: y - scrollOffset.y
                    };
                }
                return undefined;
            }

            function getViewportBounds() {

                var pad = 5,
                    margin = 0;

                var w = {
                    height: $window.innerHeight,
                    width: $window.innerWidth
                };

                var s = {
                    left: $document[0].documentElement.scrollLeft || $document[0].body.scrollLeft,
                    top: $document[0].documentElement.scrollTop || $document[0].body.scrollTop

                };

                //bounds
                var b = {
                    top: s.top + pad - margin,
                    bottom: s.top + w.height - pad - 2 * margin,
                    left: s.left + pad - margin,
                    right: s.left + w.width - pad - margin
                };
                return b;

            }

            function pointLayerAtElement(layer, element) {

                var e = getElementLayout(element),
                    l = getElementLayout(layer),
                    b = getViewportBounds(element); //bounds

                var offset = 30;
                var pointer = 10;

                //edge detects
                var below = e.bottom + l.height < b.bottom;
                var above = e.top - l.height > b.top;
                var central = e.center - l.width / 2 > b.left && e.center + l.width / 2 < b.right;
                var left = e.center - offset > b.left;
                var right = e.center + offset + l.width < b.right;

                //edge detect interpretations
                var v, h;

                if (below) {
                    v = 'south';
                } else if (above) {
                    v = 'north';
                } else {
                    v = 'south';
                }

                if (central) {
                    h = 'central';
                } else if (left && right) {
                    h = 'west';
                } else if (left && !right) {
                    h = 'east';
                } else if (right) {
                    h = 'west';
                } else {
                    h = 'central';
                }

                //return anchor positioning
                var anchor = v + h;

                switch (anchor) {

                    case "northeast":
                        return {
                            left: e.right + offset - l.width,
                            top: e.top - l.height - pointer,
                            anchor: anchor
                        };

                    case "northwest":
                        return {
                            left: e.center - offset,
                            top: e.top - l.height - pointer,
                            anchor: anchor
                        };

                    case "northcentral":
                        return {
                            left: e.center - l.width / 2,
                            top: e.top - l.height - pointer,
                            anchor: anchor
                        };

                    case "southeast":
                        return {
                            left: e.right + offset - l.width,
                            top: e.bottom + pointer,
                            anchor: anchor
                        };

                    case "southwest":
                        return {
                            left: e.center - offset,
                            top: e.bottom + pointer,
                            anchor: anchor
                        };

                        //case "southcentral":
                    default:
                        return {
                            left: e.center - l.width / 2,
                            top: e.bottom + pointer,
                            anchor: anchor
                        };

                }

            }

            function hideLayerOffscreen(layer) {
                layer.style.top = "-10000px";
            }

            function placeLayerNearElement(layer, element) {

                var p = pointLayerAtElement(layer, element);

                layer.style.top = p.top + "px";
                layer.style.left = p.left + "px";
                layer.className = css.layer + " " + p.anchor;
                layer.style.zIndex = getNextLayer();

            }

            function placeLayerAdjacentToElement(layer, element, options) {
                var layerCoords;

                var settings = {
                    offset: 0,
                    element: "southwest",
                    layer: "northwest"
                };

                if (options) {
                    angular.extend(settings, options);
                }

                layerCoords = getLayerCoordinates(settings, element, layer);

                layer.style.top = layerCoords.y + "px";
                layer.style.left = layerCoords.x + "px";
            }

            function getLayerCoordinates(settings, element, layer) {
                var coordinates = {
                        x: 0,
                        y: 0
                    },
                    anchorCoordinates = getAnchorCoordinates(settings.element, element),
                    l = getElementLayout(layer),
                    edges,
                    count = 0,
                    currPosition = settings.layer,
                    position = settings.layer;

                do {
                    count++;
                    position = currPosition;

                    if (position.indexOf("north") > -1) {
                        coordinates.y = anchorCoordinates.y;
                    } else {
                        coordinates.y = anchorCoordinates.y - l.height;
                    }

                    if (position.indexOf("west") > -1) {
                        coordinates.x = anchorCoordinates.x;
                    } else if (position.indexOf("east") > -1) {
                        coordinates.x = anchorCoordinates.x - l.width;
                    } else {
                        coordinates.x = anchorCoordinates.x - (l.width / 2);
                    }

                    edges = detectEdges(coordinates, l);

                    currPosition = updatePosition(edges, position, true);

                } while (currPosition !== position && count < 5);
                return coordinates;
            }

            function getAnchorCoordinates(position, element) {
                var coordinates = {
                        x: 0,
                        y: 0
                    },
                    e = getElementLayout(element),
                    edges,
                    count = 0,
                    currPosition = position;

                do {
                    count++;
                    position = currPosition;

                    if (position.indexOf("north") > -1) {
                        coordinates.y = e.top;
                    } else {
                        coordinates.y = e.bottom;
                    }

                    if (position.indexOf("west") > -1) {
                        coordinates.x = e.left;
                    } else if (position.indexOf("east") > -1) {
                        coordinates.x = e.right;
                    } else {
                        coordinates.x = e.center;
                    }

                    edges = detectEdges(coordinates);

                    currPosition = updatePosition(edges, position, false);

                } while (currPosition !== position && count < 5);
                return coordinates;
            }

            function detectEdges(coordinates, l) {
                var b = getViewportBounds();

                if (!l) {
                    l = {
                        height: 0,
                        width: 0
                    };
                }

                return {
                    isBelow: coordinates.y + l.height > b.bottom,
                    isAbove: coordinates.y < b.top,
                    isRight: coordinates.x + l.width > b.right,
                    isLeft: coordinates.x < b.left
                };
            }

            function updatePosition(edges, position, isLayer) {

                if (edges.isBelow) {
                    position = (isLayer) ? shiftPosition(position, "down") : shiftPosition(position, "up");
                }

                if (edges.isAbove) {
                    position = (isLayer) ? shiftPosition(position, "up") : shiftPosition(position, "down");
                }

                if (edges.isRight) {
                    position = (isLayer) ? shiftPosition(position, "right") : shiftPosition(position, "left");
                }

                if (edges.isLeft) {
                    position = (isLayer) ? shiftPosition(position, "left") : shiftPosition(position, "right");
                }

                return position;
            }

            function getScrollOffset(element) {
                var offset = {
                    x: 0,
                    y: 0
                };

                if (element.parentElement) {
                    do {
                        if (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) {
                            offset.y += element.scrollTop;
                            offset.x += element.scrollLeft;
                        }

                        element = element.parentElement;

                    } while (element !== $document[0].body);
                }

                return offset;
            }

            function shiftPosition(startingPosition, direction) {
                var h = [
                        'west',
                        'central',
                        'east'
                    ],
                    v = [
                        'north',
                        'south'
                    ],
                    position = {
                        h: "",
                        v: ""
                    };

                h.forEach(function(dir, index) {
                    if (startingPosition.indexOf(dir) > -1) {
                        position.h = index;
                    }
                });

                v.forEach(function(dir, index) {
                    if (startingPosition.indexOf(dir) > -1) {
                        position.v = index;
                    }
                });

                switch (direction) {
                    case 'left':
                        if (position.h > 0) {
                            startingPosition = startingPosition.replace(h[position.h], h[position.h - 1]);
                        }
                        break;
                    case 'right':
                        if (position.h < (h.length - 1)) {
                            startingPosition = startingPosition.replace(h[position.h], h[position.h + 1]);
                        }
                        break;
                    case 'up':
                        if (position.v > 0) {
                            startingPosition = startingPosition.replace(v[position.v], v[position.v - 1]);
                        }
                        break;
                    case 'down':
                        if (position.v < (v.length - 1)) {
                            startingPosition = startingPosition.replace(v[position.v], v[position.v + 1]);
                        }
                        break;
                }

                return startingPosition;
            }


            /*
             * TODO: should move the tooltipLayer creation and DOM manipulation in to a directive and expose the content area via scope
             * */
            var layer;

            function getTooltipLayer() {

                if (!layer) {

                    layer = $document[0].createElement("div");
                    layer.className = css.tooltipLayer;
                    layer.innerHTML = "<div class='arrow-box'><p>{{pmcc.tooltip}}</p></div>";
                    $document[0].body.appendChild(layer);

                }

                return layer;
            }

            function setTooltipContent(content) {

                layer.getElementsByTagName("p")[0].innerHTML = pmccServicesMarkdown.parseMarkdown(content);
            }

            return {
                getNextLayer: getNextLayer,
                getTooltipLayer: getTooltipLayer,
                setTooltipContent: setTooltipContent,
                pointLayerAtElement: pointLayerAtElement,
                placeLayerNearElement: placeLayerNearElement,
                placeLayerAdjacentToElement: placeLayerAdjacentToElement,
                hideLayerOffscreen: hideLayerOffscreen,
                getViewportBounds: getViewportBounds
            };
        }]);

})();
/**
 * Created by Dennis Tang on 4/13/15.
 */

/**
 * @ngdoc module
 * @name pmcc.pmccServicesMarkdown
 * @restrict E
 * @element ANY
 * @priority 1000
 **/

(function() {

    angular.module("pmcc")
        .factory("pmccServicesMarkdown", function() {

            var formulaQueue = [];
            var types = {
                formula: 1
            };


            var formulaDictionary = [

                //Singletons
                {
                    key: "\\*",
                    value: "<pmcc-md-multiply />"
                },

                {
                    key: "([^<])\\/([^>]\)",
                    value: "$1<pmcc-md-divide/>$2"
                },

                {
                    key: "\\+",
                    value: "<pmcc-md-add />"
                },

                {
                    key: "\\s-\\s",
                    value: "<pmcc-md-subtract />"
                },

                {
                    key: "=",
                    value: "<pmcc-md-equals />"
                },


                //Pairs
                {
                    key: "\\$\\$(.*?)\\$\\$",
                    value: "<pmcc-md-formula>$1</pmcc-md-formula>"
                },

                {
                    key: "\\((.*?)\\)",
                    value: "<pmcc-md-group>$1</pmcc-md-group>"
                }

            ];

            function _parseMarkdown(arr, str) {
                while (arr.length) {
                    var o = arr.shift();
                    var re = new RegExp(o.key, "gim");
                    var newStr = str.replace(re, o.value);

                    return _parseMarkdown(arr, newStr);
                }

                return str;
            }

            function parseMarkdown(content) {
                //var arr = markdownDictionary.slice( 0 );


                content = maskFormulas(content);
                content = parseFormulas(content);

                content = parseParagraphs(content);


                return content;

                //return _parseMarkdown( arr, content );
            }




            function parseParagraphs(str) {


                var key = "\\n(.*?)\\n\\n",
                    value = "<pmcc-md-paragraph>$1</pmcc-md-paragraph>",
                    re = new RegExp(key, "gim");

                return str.replace(re, value);



            }




            function maskFormulas(str) {

                var matches = str.match(/\${2}(.*?)\${2}/gim);

                if (matches && matches.length) {
                    for (var i = 0; i < matches.length; i++) {

                        var match = matches[i];
                        var pid = "pmcc[" + (new Date()).getTime() + "-" + i + "]";

                        formulaQueue.push({
                            token: pid,
                            text: match
                        });

                        str = str.replace(match, pid);

                    }
                }

                return str;

            }

            function parseFormulas(content) {

                while (formulaQueue.length) {

                    var f = formulaQueue.shift();
                    formula = _parseFormula(f.text);

                    content = content.replace(f.token, formula);
                }
                return content;

            }

            function _parseFormula(str) {

                var arr = formulaDictionary.slice(0);

                while (arr.length) {
                    var o = arr.shift();
                    var re = new RegExp(o.key, "gim");
                    str = str.replace(re, o.value);


                }

                return str;

            }

            return {
                parseMarkdown: parseMarkdown
            };
        });

})();

(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccServicesMenu //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")

    .directive("pmccServicesMenu", [
        "$timeout",
        "$document",
        "pmccServicesLayer",
        function($timeout, $document, pmccServicesLayer) {
            var keys = {
                    up: 40,
                    down: 38,
                    enter: 13
                },
                $body = $document.find('body').eq(0);

            return {
                restrict: "E",
                replace: true,
                template: function(element, attrs) {
                    var template = '<div class="pmcc-menu-wrapper" ng-style="{\'z-index\': zIndex}">' +
                        '<ul class="pmcc-menu">' +
                        '<li ng-click="select( item )" class="pmcc-menu-item" ng-repeat="item in items" ng-class="{ \'disable\':item.disable == true, \'selected\': $index === selectedIndex, \'highlight\': $index === highlightedIndex, \'no-select\': item.type===\'divider\'}"> ' +
                        '<div ng-class="{\'divider\': item.type === \'divider\'}">' +
                        '<span ng-if="item.icon" ng-class="item.icon"></span>' +
                        '<span ng-if="item.label">{{::item.label}}</span>' +
                        '</div>' +
                        '</li>' +
                        '</ul>' +
                        '</div>';

                    return template;
                },
                scope: {
                    items: "=",
                    model: "=?",
                    isOpen: "=",
                    keyHandler: "="
                },
                link: function(scope, element, attrs) {
                    var control = element.parent()[0].getElementsByClassName("pmcc-menu-control")[0],
                        menu = element[0],
                        scrollableParents = [];

                    scope.open = false;
                    scope.select = select;
                    scope.selectByIndex = selectByIndex;
                    scope.keyHandler = keyHandler;
                    scope.uid = "pmcc-" + new Date().getTime();
                    scope.zIndex = 'inherit';

                    initialize();

                    function keyHandler(event) {

                        switch (event.keyCode) {
                            case keys.up:
                                if (scope.isOpen) {
                                    next();
                                } else {
                                    scope.isOpen = true;
                                }

                                event.preventDefault();

                                break;
                            case keys.down:
                                previous();

                                event.preventDefault();

                                break;
                            case keys.enter:
                                scope.selectByIndex();
                                hide();

                                break;
                        }

                    }

                    function select(item) {

                        if (item.disable === true || item.type === "divider") return;

                        if (item.action) {
                            item.action();
                            return;
                        }

                        scope.model = item;
                    }

                    function selectByIndex() {

                        var item = scope.items[scope.highlightedIndex];

                        if (item) {
                            select(item);
                        }
                    }

                    function show() {
                        $body.append(menu);
                        pmccServicesLayer.placeLayerAdjacentToElement(menu, control);

                        findScrollableParents(control);
                        scrollableParents.forEach(function(element) {
                            angular.element(element).one("scroll", hide);
                        });

                        scope.selectedIndex = updateSelectedIndex();
                        scope.highlightedIndex = updateSelectedIndex();

                        scope.zIndex = pmccServicesLayer.getNextLayer();
                        scope.open = true;

                        $document.one("scroll", hide);
                    }

                    function findScrollableParents(element) {
                        do {
                            element = element.parentElement;

                            if (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) {
                                scrollableParents.push(element);
                            }
                        } while (element.parentElement);
                    }

                    function hide() {

                        timeoutId = $timeout(function() {
                            scope.open = false;
                            scope.isOpen = false;
                            pmccServicesLayer.hideLayerOffscreen(menu);
                            angular.element(control).parent().append(menu);

                            scrollableParents.forEach(function(element) {
                                angular.element(element).off("scroll", hide);
                            });
                            scrollableParents = [];
                        }, 250);

                    }

                    function initialize() {

                        scope.selectedIndex = updateSelectedIndex();
                        scope.highlightedIndex = updateSelectedIndex();

                        if (scope.model === undefined) {
                            scope.model = null;
                        }

                    }

                    function updateSelectedIndex() {
                        for (var i = 0; i < scope.items.length; i++) {
                            var o = scope.items[i];
                            var v = o.value || o.label;
                            var selected = scope.model.value || scope.model.label;

                            if (v && v === selected) {
                                return i;
                            }
                        }

                        return 0;
                    }

                    function next() {
                        var i = scope.highlightedIndex + 1;

                        //skip disabled items
                        while (i < scope.items.length && scope.items[i] && (scope.items[i].disable || scope.items[i].type == "divider")) {
                            ++i;
                        }

                        if (i < scope.items.length)
                            scope.highlightedIndex = i;
                    }

                    function previous() {

                        var i = scope.highlightedIndex - 1;

                        //skip disabled items
                        while (i >= 0 && scope.items[i] && (scope.items[i].disable || scope.items[i].type == "divider")) {
                            --i;
                        }

                        if (i >= 0)
                            scope.highlightedIndex = i;
                    }

                    var isOpenListener = scope.$watch("isOpen", function(isOpen) {
                        if (isOpen) {
                            show();
                        } else {
                            hide();
                        }
                    });

                    scope.$on("$destroy", function() {
                        $timeout.cancel(timeout);
                        isOpenListener();
                    });

                }
            };
        }
    ]);

})();

(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccServicesOverflow //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     * TODO: Use layer service for menu dropdown
     * TODO: How to handle for toolbars where buttons have ng-click?
     **/

    angular.module("pmcc")
        .directive("pmccServicesOverflow", ["$compile", "$timeout", "$window", function($compile, $timeout, $window) {
            return {
                replace: true,
                restrict: "E",
                scope: {
                    items: '='
                },
                template: '<li ng-show="required" ng-click="toggle()" class="pmcc-services-overflow-container">' +
                    'More <span class="pmcc-ico-1x pmcc-ico-caret-down"></span>' +
                    '<ul ng-show="active">' +
                    '<li ng-class="{\'pmcc-services-overflow-item-selected\': item.selected}"' +
                    'ng-click="item.action()"' +
                    'ng-show="item.appearsInOverflowMenu"' +
                    'ng-repeat="item in items">' +
                    '{{item.name}}' +
                    '</li>' +
                    '</ul></li>',
                link: function(scope, element, attrs) {

                    var rendered = false;
                    scope.active = false;
                    scope.required = false;

                    scope.toggle = function(bool) {
                        scope.active = !scope.active;
                    };

                    var onResize = debounceFn(function() {
                        calculate();
                    }, 100);

                    function debounceFn(func, wait, immediate) {
                        var timeout;
                        return function() {
                            var context = this,
                                args = arguments;
                            var later = function() {
                                timeout = null;
                                if (!immediate) func.apply(context, args);
                            };
                            var callNow = immediate && !timeout;
                            clearTimeout(timeout);
                            timeout = setTimeout(later, wait);
                            if (callNow) func.apply(context, args);
                        };
                    }

                    function calculate() {
                        var container = element.parent();
                        var rootElement = container.parent();
                        var containerChildren = container.children();
                        var childrenLength = 0;
                        var overflowItems = 0;
                        var visibleLen = 0;
                        var sizePadding = 0;

                        // Adjust padding/margin to account for depending on various tab types' CSS rules
                        if (rootElement[0].tagName === "PMCC-TABSET") {
                            switch (rootElement.attr('type')) {
                                case 'tab':
                                case 'pill':
                                    sizePadding = 20;
                                    break;
                                case 'panel':
                                    sizePadding = 10;
                                    break;
                            }
                        }

                        // Calculate which ones go beyond the parent container and affect visibility
                        if (containerChildren.length > scope.items.length) {
                            visibleLen = containerChildren.length - 1;
                        } else {
                            visibleLen = containerChildren.length;
                        }
                        for (var i = 0; i < visibleLen; i++) {
                            childrenLength += containerChildren[i].clientWidth + sizePadding;

                            if (childrenLength < container[0].clientWidth) {
                                scope.items[i].appearsInOverflowMenu = false;
                            } else {
                                scope.items[i].appearsInOverflowMenu = true;
                                overflowItems++;
                            }
                        }

                        if ((container[0].scrollWidth + (overflowItems * sizePadding)) > container[0].clientWidth) {
                            scope.required = true;
                        } else {
                            scope.required = false;
                        }

                        if (rendered) {
                            scope.$apply();
                        } else {
                            rendered = true;
                        }
                    }

                    // Watch the tabs, update accordingly TODO: Replace with ngDocs
                    var overflowItems = scope.$watch(scope.items,
                        function() {
                            if (!rendered) {
                                $timeout(function() {
                                    calculate();
                                }, 0);
                            }
                        }, true);

                    // Have to bind to window because observing directive element size changes
                    // only works when element itself is directly resized, not when window is.
                    angular.element($window).bind('resize', onResize);

                    scope.$on("$destroy", function() {
                        overflowItems();
                        angular.element($window).unbind('resize', onResize);
                    });
                }

            };
        }]);

})();

(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccSetFocus //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict A //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     **/

    angular.module("pmcc")
        .directive("pmccSetFocus", ["$timeout", function($timeout) {
            return {
                restrict: "A",
                link: function(scope, element, attrs) {

                    var focusWatcher = scope.$watch(attrs.pmccSetFocus,
                        function(newValue) {
                            if (newValue) {
                                $timeout(function() {
                                    element[0].focus();
                                });
                            }
                        }, true);

                    scope.$on('$destroy', function() {
                        focusWatcher();
                    });

                }
            };
        }]);

})();

(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccSingleselect //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccSingleselect", ["$filter", "$document", "$interpolate", "$timeout", "pmccMultiselectMessaging", function($filter, $document, $interpolate, $timeout, pmccMultiselectMessaging) {


            var trigger = '<pmcc-ss-trigger ng-class="{\'active\': open}"' +
                'ng-click="toggleLayer()">{{ triggerLabel }}</pmcc-ss-trigger>';

            var availableSectionHeader = '<div class="pmcc-ss-section-header"' +
                'ng-show="instructions || selectedItems.length > 0">' +
                '<div ng-if="instructions"' +
                'ng-hide="selectedItems.length > 0"><strong>{{ instructions }}:</strong></div>' +
                '<button type="button" class="pmcc-btn-sm pmcc-secondary"' +
                'ng-show="selectedItems.length > 0 && availableItemsSearchEmpty"' +
                'ng-click="deselectAll()">Clear</button>' +
                '</div>';

            var availableSectionSearch = '<div class="pmcc-input-search">' +
                '<span class="label">Search: </span>' +
                '<input type="text"' +
                'ng-model="availableItemsSearchQuery"' +
                'ng-model-options="{ debounce: {\'default\': 400, \'blur\': 0} }"' +
                'ng-change="searchAvailableItems()"' +
                'pmcc-set-focus="open"/>' +
                '<span class="pmcc-ico-close"' +
                'ng-show="!availableItemsSearchEmpty"' +
                'ng-click="clearAvailableItemsSearch()">' +
                '</span>' +
                '</div>';

            var availableSectionList = '<ul class="pmcc-available-list" pmcc-infinite-scroll="loadAvailableItems()">' +
                '<li class="messaging" ng-if="!viewableAvailableItems.length || settings.searchCallbackEnabled && !availableItemsSearchEmpty && !numRecordsFound">{{ ::noMatchesMessage }}</li>' +
                '<li class="clear-selection" ng-if="selectedItems.length > 0 && availableItemsSearchEmpty"><a href="" ng-click="deselectAll()">{{ selectedItemsSoftStore[0][settings.labelProp] }}</a></li>' +
                '<li ng-repeat="availableItem in viewableAvailableItems" ' +
                'ng-class="{\'selected\': isSelected(availableItem[settings.idProp])}">' +
                '<a href="" ng-click="selectItem(availableItem)">{{ availableItem[settings.labelProp] }}</a>' +
                '</li>' +
                '<li class="messaging" ng-if="settings.searchCallbackEnabled && maxNumRecordsExceeded">{{ matchesExceedsLimitMessageInterpolated }}</li>' +
                '</ul>';

            var template = '<div class="pmcc-ss-container" ng-class="{\'disabled\': disabled}">' +
                trigger +
                '<pmcc-ss-layer ng-class="{\'active\': open, \'layer-push\': settings.layerPositioning}"' +
                'ng-style="{display: open ? \'block\' : \'none\'}">' +
                '<div class="pmcc-available-section">' +
                availableSectionHeader +
                availableSectionSearch +
                availableSectionList +
                '</div>' +
                '</pmcc-ss-layer>' +
                '</div>';

            return {
                restrict: "E",
                template: template,
                scope: {
                    disabled: '=?',
                    availableItems: '=',
                    selectedItems: '=',
                    instructions: '@?',
                    doneCallback: '=',
                    cancelCallback: '=',
                    searchCallback: '&?',
                    maxNumRecordsReturned: '@?',
                    numRecordsFound: '=?',
                    noMatchesMessage: '=?',
                    matchesExceedsLimitMessage: '@?',
                    ssSettings: '=',
                    defaultLabel: '@?'
                },
                link: function($scope, $elem, $attrs) {
                    var singleselectId = null;
                    var availableItemsStoreIndex = 0;
                    var numRecordsFoundWatcher;
                    var mutableSettings = {
                        idProp: 'id',
                        labelProp: 'name',
                        maxViewableItems: 5,
                        searchCallbackEnabled: false
                    };
                    mutableSettings = angular.extend(mutableSettings, $scope.ssSettings);
                    var permanentSettings = {
                        layerPositioning: mutableSettings.layerPositioning === 'push', // push | overlay
                        selectedItemsLimit: 1,
                        showDeselectAll: true
                    };
                    $scope.settings = angular.extend(mutableSettings, permanentSettings);

                    $scope.disabled = angular.isDefined($scope.disabled) ? $scope.disabled : false;
                    $scope.availableItemsSearchEmpty = true;
                    $scope.availableItemsSearchQuery = '';
                    $scope.availableItemsStore = $scope.availableItems;
                    $scope.selectedItemsSoftStore = [];
                    $scope.triggerLabel = '';

                    $scope.eventEmitters = {
                        onItemDeselect: angular.noop,
                        onItemSelect: angular.noop,
                        onMultiselectCancel: $scope.cancelCallback ? $scope.cancelCallback : angular.noop,
                        onMultiselectDone: $scope.doneCallback ? $scope.doneCallback : angular.noop
                    };

                    // Component feature checks
                    $scope.instructionsVisible = $scope.instructions && $scope.settings.selectedItemsLimit > 0;

                    if (!angular.isDefined($scope.noMatchesMessage)) {
                        $scope.noMatchesMessage = pmccMultiselectMessaging.NO_RESULTS_FOUND;
                    }

                    var availableItemsWatcher = $scope.$watch('availableItems', function(newData) {
                        resetAvailableItemsStore(newData);

                        if (!angular.isDefined($attrs.numRecordsFound)) {
                            $scope.numRecordsFound = $scope.availableItems.length;
                        }
                    });

                    if (angular.isDefined($attrs.searchCallback)) {
                        $scope.settings.searchCallbackEnabled = true;

                        if (!angular.isDefined($attrs.numRecordsFound)) {
                            $timeout(function() {
                                if (!angular.isDefined($scope.matchesExceedsLimitMessage)) {
                                    $scope.matchesExceedsLimitMessage = pmccMultiselectMessaging.RESULTS_LIMIT_EXCEEDED;
                                }

                                numRecordsFoundWatcher = $scope.$watch('numRecordsFound', function() {
                                    $scope.numRecordsFound = angular.isDefined($scope.numRecordsFound) ? $scope.numRecordsFound : 0;
                                    $scope.maxNumRecordsExceeded = $scope.maxNumRecordsReturned < $scope.numRecordsFound;
                                    $scope.numRecordsFoundCommaSeparated = commaSeparate($scope.numRecordsFound);
                                    $scope.matchesExceedsLimitMessageInterpolated = $interpolate($scope.matchesExceedsLimitMessage)($scope);
                                });
                            });
                        }

                    }

                    function updateTriggerLabel() {
                        $scope.triggerLabel = pmccMultiselectMessaging.TRIGGER_LABEL(
                            $scope.selectedItems,
                            $scope.availableItems.length,
                            $scope.settings.labelProp,
                            $attrs.defaultLabel
                        );
                    }
                    updateTriggerLabel();

                    $scope.toggleLayer = function() {
                        if ($scope.disabled) {
                            return false;
                        }
                        $scope.open = !$scope.open;

                        if ($scope.open) {
                            $elem.bind('click', function() {
                                singleselectId = $scope.$id;
                            });
                            $scope.selectedItemsSoftStore = angular.copy($scope.selectedItems);
                            $document.bind('click', $scope.closeLayerHandler);
                        } else {
                            $document.unbind('click', $scope.closeLayerHandler);
                        }
                    };

                    $scope.closeLayer = function(param) {
                        if (param === 'close') {
                            $scope.selectedItems = $scope.selectedItemsSoftStore;
                            $scope.eventEmitters.onMultiselectDone($scope.selectedItems);
                        } else {
                            $scope.eventEmitters.onMultiselectCancel($scope.selectedItems);
                        }

                        updateTriggerLabel();
                        $scope.open = false;
                        $document.unbind('click', $scope.closeLayerHandler);
                    };

                    $scope.closeLayerHandler = function() {
                        if (singleselectId !== $scope.$id) {
                            $scope.$apply($scope.closeLayer);
                        }
                        singleselectId = null;
                    };

                    function findSelectedItemIndex(id) {
                        var filter = $filter('filter')($scope.selectedItemsSoftStore, function(item) {
                            return item.id === id;
                        });

                        return $scope.selectedItemsSoftStore.indexOf(filter[0]);
                    }

                    $scope.isSelected = function(id) {
                        var index = findSelectedItemIndex(id);

                        return index > -1;
                    };

                    $scope.selectItem = function(obj, remove) {
                        var itemId = obj[$scope.settings.idProp];
                        var exists = $scope.isSelected(itemId);
                        remove = remove || false;

                        if (!remove && exists || $scope.selectedItemsSoftStore.length === $scope.settings.selectedItemsLimit) {
                            var removedItem = $scope.selectedItemsSoftStore.shift();
                            $scope.eventEmitters.onItemDeselect(removedItem);
                            $scope.selectedItemsSoftStore.push(obj);
                            $scope.eventEmitters.onItemSelect(obj);
                        } else {
                            $scope.selectedItemsSoftStore.push(obj);
                            $scope.eventEmitters.onItemSelect(obj);
                        }

                        $scope.closeLayer('close');
                    };

                    $scope.deselectAll = function() {
                        $scope.selectedItemsSoftStore.splice(0, $scope.selectedItemsSoftStore.length);

                        $scope.closeLayer('close');
                    };

                    $scope.searchAvailableItems = function() {
                        if ($scope.availableItemsSearchQuery) {
                            if ($scope.settings.searchCallbackEnabled) {
                                performSearch($scope.availableItemsSearchQuery);
                            } else {
                                var filterExp = {};
                                filterExp[$scope.settings.labelProp] = $scope.availableItemsSearchQuery;

                                var data = $filter('filter')($scope.availableItems, filterExp);
                                resetAvailableItemsStore(data);
                                $scope.availableItemsSearchEmpty = false;
                            }
                        }

                        if ($scope.availableItemsSearchQuery === '') {
                            if ($scope.settings.searchCallbackEnabled) {
                                performSearch($scope.availableItemsSearchQuery);
                            } else {
                                resetAvailableItemsStore($scope.availableItems);
                                $scope.availableItemsSearchEmpty = true;
                            }
                        }
                    };

                    function resetAvailableItemsStore(data) {
                        $scope.availableItemsStore = data;
                        availableItemsStoreIndex = 0;
                        $scope.viewableAvailableItems = [];
                        loadAvailableItems(100);
                    }

                    function loadAvailableItems(step) {
                        step = step || 20;
                        for (var i = 0; i < step; i++) {
                            if ($scope.availableItemsStore[availableItemsStoreIndex]) {
                                $scope.viewableAvailableItems.push($scope.availableItemsStore[availableItemsStoreIndex]);
                                availableItemsStoreIndex++;
                            }
                        }
                    }

                    $scope.viewableAvailableItems = [];
                    $scope.loadAvailableItems = loadAvailableItems;
                    loadAvailableItems(100);

                    function performSearch(query) {
                        var promise = $scope.searchCallback({
                            query: query
                        }).then(function(results) {
                            $scope.availableItems = results.data.items;
                            $scope.numRecordsFound = results.data.metaData.totalRecords;

                            $scope.availableItemsSearchEmpty = query === '';
                        }, function() {
                            // Failed
                        });

                        return promise;
                    }

                    $scope.clearAvailableItemsSearch = function() {
                        $scope.availableItemsSearchQuery = '';
                        $scope.searchAvailableItems();
                    };

                    function commaSeparate(num) {
                        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    }

                    $scope.$on('$destroy', function() {
                        availableItemsWatcher();
                        if ($scope.settings.searchCallbackEnabled) {
                            numRecordsFoundWatcher();
                        }
                    });
                }
            };
        }]);

})();

(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccSwitch //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccSwitch", function() {
            return {
                restrict: "E",
                replace: true,
                template: "<div class='pmcc-switch' ng-click='toggle()'>" +
                    "<off ng-show='model===false'><handle></handle><label>{{::labelFalse}}</label></off>" +
                    "<on  ng-show='model===true'><label>{{::labelTrue}}</label><handle></handle></on>" +
                    "</div>",
                scope: {
                    model: "=",
                    labelFalse: "@",
                    labelTrue: "@"
                },
                link: function(scope, element, attrs) {


                    scope.toggle = function() {

                        scope.model = !scope.model;

                    };


                }
            };
        });

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccTableRichrow //start with the module name. the second part is always directive. the directive
     *     name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     *
     **/

    angular.module("pmcc")
        .directive("pmccTableRichrow", ["$timeout", function($timeout) {
            return {
                restrict: "E",
                replace: true,
                template: "<div class='pmcc-table-richrow'>" +
                    "<table class='pmcc-table pmcc-richrow-header'>" +
                    "<thead ng-if='headerTemplate'><tr ng-include='headerTemplate'></tr>" +
                    "</thead>" +
                    "</table>" +
                    "<table class='pmcc-table pmcc-richrow-data' pmcc-infinite-scroll='infiniteScroll()' ng-style='{\"height\": height}' ng-class='{\"opaque-rows\": areRowsOpen }'>" +
                    "<tbody ng-repeat='row in rowModel' pmcc-richrow ng-class='{\"showDetail\": isOpen}'>" +
                    "<tr class='pmcc-richrow-data-item' ng-include='rowTemplate' ng-click='handleClick($event)'></tr>" +
                    "<tr><td colspan={{numColumns}}><div class='pmcc-richrow-detail'ng-class='{\"opening\": isOpening}'  ng-if='isRowDetailReady' ng-include='detailTemplate' ng-style='{\"max-height\": detailMaxHeight}'></div></td></tr>" +
                    "</tbody>" +
                    "</table>" +
                    "</div>",
                scope: {
                    rowTemplate: "@",
                    detailTemplate: "@",
                    headerTemplate: "@",
                    detailMaxHeight: "@",
                    numColumns: "@",
                    openMultiple: "@",
                    rowModel: "=",
                    closeAll: "=",
                    detailCallback: "&",
                    height: "@",
                    infiniteScroll: "&"
                },
                controller: ["$scope", function($scope) {
                    var ctrl = this;
                    $scope.height = $scope.height || 'auto';
                    $scope.isRowDetailShown = {};
                    $scope.rows = {};
                    $scope.getOpenRows = function() {
                        var result = [];

                        for (var row in $scope.rows) {
                            if ($scope.rows[row].isOpen) {
                                result.push($scope.rows[row]);
                            }
                        }

                        return result;
                    };

                    ctrl.toggleRow = function(id) {
                        if ($scope.openMultiple == "false") {
                            for (var row in $scope.rows) {
                                if (row != id) {
                                    ctrl.hideRowDetail(row);
                                }
                            }
                        }

                        if ($scope.rows[id].isOpen) {
                            ctrl.hideRowDetail(id);
                        } else {
                            ctrl.showRowDetail(id);
                        }
                    };

                    ctrl.showRowDetail = function(id) {
                        $scope.rows[id].isRowDetailReady = true;
                        $scope.rows[id].isOpening = true;
                        if ($scope.detailCallback) {
                            $scope.detailCallback({
                                id: id
                            });
                        }

                        $timeout(function() {
                            $scope.rows[id].isOpen = true;
                            ctrl.setTableRowOpacity();
                        }, 0);

                        $timeout(function() {
                            $scope.rows[id].isOpening = false;
                        }, 500);
                    };

                    ctrl.hideRowDetail = function(id) {
                        $scope.rows[id].isOpen = false;
                        $scope.rows[id].isOpening = true;
                        $timeout(function() {
                            $scope.rows[id].isRowDetailReady = false;
                            $scope.rows[id].isOpening = false;

                            ctrl.setTableRowOpacity();
                        }, 500);
                    };

                    ctrl.setTableRowOpacity = function() {
                        var areRowsOpen = $scope.getOpenRows().length > 0;

                        $scope.areRowsOpen = areRowsOpen;

                        if ($scope.closeAll !== undefined) {
                            $scope.closeAll = areRowsOpen;
                        }
                    };

                    ctrl.closeAllRows = function() {
                        for (var row in $scope.rows) {
                            if ($scope.rows[row].isOpen) {
                                ctrl.hideRowDetail(row);
                            }
                        }
                        $scope.areRowsOpen = false;
                    };

                    if ($scope.closeAll !== undefined) {
                        var watchCloseAll = $scope.$watch("closeAll", function(newValue) {
                            if (!newValue) {
                                ctrl.closeAllRows();
                            }
                        });
                    }

                    $scope.$on("$destroy", function() {
                        if (watchCloseAll) {
                            watchCloseAll();
                        }
                    });

                }],
                link: function(scope, element, attrs, richrowCtrl) {
                    richrowCtrl.tableElement = element[0];
                }
            };
        }])
        .directive("pmccRichrow", function() {
            function isClickableElement(element) {
                return element.tagName === "BUTTON" || element.tagName === "A" || element.tagName === "INPUT";
            }

            return {
                restrict: "A",
                require: "^pmccTableRichrow",
                link: function(scope, element, attrs, richrowCtrl) {
                    scope.rows[scope.row.id] = scope;

                    scope.isOpen = false;
                    scope.isRowDetailReady = false;

                    scope.handleClick = function(e) {
                        if (!richrowCtrl.hasControl && !isClickableElement(e.target)) {
                            richrowCtrl.toggleRow(scope.row.id);
                        }
                    };
                }
            };
        })
        .directive("pmccRowToggle", function() {
            return {
                restrict: "E",
                replace: true,
                require: "^pmccTableRichrow",
                template: "<button class='pmcc-btn-sm pmcc-secondary pmcc-row-toggle' ng-class='{active: isOpen}' ng-click='rowControlClick($event)'>{{label()}} Details</button>",
                link: function(scope, element, attrs, richRowCtrl) {
                    richRowCtrl.hasControl = true;
                    scope.label = function() {
                        return (scope.rows[scope.row.id].isOpen) ? "Hide" : "View";
                    };

                    scope.rowControlClick = function(e) {
                        e.stopPropagation();
                        richRowCtrl.toggleRow(scope.row.id);
                    };
                }

            };
        });

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccScrollableTable //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccTableScrollable", ["$timeout", scrollableTable])
        .directive("pmccTableSelectionModel", tableSelectionModel)
        .directive("pmccTableRowSelectOne", tableRowSelectOne)
        .directive("pmccTableRowSelectMany", tableRowSelectMany)
        .directive("pmccTableToggleSelectAll", tableToggleSelectAll)
        .directive("pmccTableToggleManageList", tableToggleManageList);

    //adapted from this article: https://www.pointblankdevelopment.com.au/blog/angularjs-fixed-header-scrollable-table-directive

    function scrollableTable($timeout) {

        return {
            restrict: "A",
            link: link
        };

        function link(scope, element, attrs) {
            var elem = element[0],
                timeoutPromise;

            scope.$watch(tableDataLoaded, function(isTableDataLoaded) {
                if (isTableDataLoaded) {
                    transformTable();
                }
            });

            scope.$on("$destroy", function() {

                if (timeoutPromise)
                    $timeout.cancel(timeoutPromise);

            });

            function tableDataLoaded() {
                /*signal that table data is loaded when we find a cell in tbody
                 and it has not be given a width yet
                 */
                var firstCell = elem.querySelector('tbody tr:first-child td:last-child');
                return firstCell && !firstCell.style.width;
            }

            function transformTable() {

                //reset display styles so column widths are correctly measured
                angular.element(elem.querySelectorAll('thead, tbody,tfoot')).css('display', '');

                //wrap next section in a timeout to give the browser a chance to finish rendering table data
                timeoutPromise =
                    $timeout(
                        function() {
                            //set column widths
                            angular.forEach(elem.querySelectorAll('tr:first-child th'), function(TH, i) {

                                var TD = elem.querySelector('tbody tr:first-child td:nth-child(' + (i + 1) + ')');
                                var TF = elem.querySelector('tfoot tr:first-child td:nth-child(' + (i + 1) + ')');

                                var columnWidth = TD ? TD.offsetWidth : TH.offsetWidth;

                                if (TD) {
                                    TD.style.width = columnWidth + "px";
                                }

                                if (TH) {
                                    TH.style.width = columnWidth + "px";
                                }

                                if (TF) {
                                    TF.style.width = columnWidth + "px";
                                }

                            });

                            //set styles on thead and tfoot
                            angular.element(elem.querySelectorAll('thead, tfoot')).css('display', 'block');

                            //set styles on tbody
                            angular.element(elem.querySelectorAll('tbody')).css({
                                'display': 'block',
                                'height': attrs.tableHeight || 'inherit',
                                'overflow': 'auto'
                            });

                            //reduce width of last column by width of scrollbar when it is present
                            var tbody = elem.querySelector('tbody');
                            var scrollbarWidth = tbody.offsetWidth - tbody.clientWidth;
                            if (scrollbarWidth > 0) {
                                //reducing width by 2 pixels to account for borders
                                scrollbarWidth -= 2;
                                var lastColumn = elem.querySelector('tbody tr:first-child td:last-child');
                                lastColumn.style.width = (lastColumn.offsetWidth - scrollbarWidth) + "px";

                            }

                        }
                    );

            }

        }
    }

    function tableSelectionModel() {

        return {
            restrict: "A",
            controller: ["$scope", "$element", "$attrs", myController],
            controllerAs: "pmccTable",
            scope: {
                model: "=pmccTableSelectionModel"
            }
        };

        function myController($scope, $element, $attrs) {

            var self = this;
            $scope.isManageListModeOn = false;


            if (!$scope.model) {
                console.error("PMCC-TABLE: no selection model specified");
                return;
            }


            self.rowSelectionLimit = -1;
            if ($attrs.rowSelectionLimit) {
                self.rowSelectionLimit = $attrs.rowSelectionLimit;
            }

            self.selectOne = function(row) {

                while ($scope.model.length > 0) {
                    $scope.model[0].selected = false;
                    $scope.model.shift();
                }

                row.selected = true;
                $scope.model.push(row);
                $scope.$apply();

            };

            self.selectMany = function(row) {

                if (!$scope.model) {
                    console.error("PMCC-TABLE: no selection model specified");
                    return;
                }



                //if it is already selected remove it
                var removed = false;
                for (var i = 0; i < $scope.model.length; i++) {

                    if ($scope.model[i] === row) {

                        row.model.selected = false;
                        $scope.model.splice(i, 1);
                        removed = true;
                        if (self.setSelectAll)
                            self.setSelectAll(false); //1 row deselected so set selectAll to false
                        break;
                    }
                }

                //enforce limit when it exists
                if (self.rowSelectionLimit > -1 && $scope.model.length >= self.rowSelectionLimit) {

                    row.model.selected = false;

                    return;
                }

                //if we haven't removed it then add it
                if (removed === false) {

                    if (self.rowSelectionLimit === -1 || $scope.model.length < self.rowSelectionLimit) {
                        row.model.selected = true;
                        $scope.model.push(row);
                    } else {
                        row.model.selected = false;
                    }

                }

            };

            self.toggleAll = function(selectAll) {
                self.setSelectAll(selectAll);
                $scope.model.length = 0;
                for (var r = 0; r < rows.length; r++) {
                    rows[r].model.selected = selectAll;
                    if (selectAll) {
                        $scope.model.push(rows[r]);
                    }
                }
            };


            self.setSelectAll = function() {};

            self.registerSelectAllFunction = function(func) {

                self.setSelectAll = func;

            };

            self.deregisterSelectAllFunction = function() {

                self.setSelectAll = null;

            };

            var rows = [];
            self.register = function(row) {
                rows.push(row);
            };

            self.deregister = function(row) {
                var i = 0;
                while (i++ < rows.length) {

                    if (rows[i] === row)
                        rows.splice(i, 1);

                }
            };

        }

    }

    function tableRowSelectOne() {

        return {
            restrict: "A",
            link: myLink,
            scope: {
                "selected": "=pmccSelected"
            },
            require: "^pmccTableSelectionModel"
        };

        function myLink(scope, element, attrs, parent) {

            var css = {
                selected: "pmcc-selected"
            };

            scope.model = {
                rowId: attrs.pmccRowId,
                selected: false,
                select: function() {
                    parent.selectOne(scope.model);
                }
            };

            element.on("click", scope.model.select);

            var watchSelected =
                scope.$watch('model.selected', function(newValue) {

                    if (newValue === true) {
                        element.addClass(css.selected);
                    } else {
                        element.removeClass(css.selected);
                    }

                });

            scope.$on("$destroy", function() {
                watchSelected();
                element.off('click', scope.model.select);
            });

        }

    }

    function tableRowSelectMany() {

        return {
            restrict: "A",
            link: link,
            replace: true,
            template: "<td style='width:10px;text-align:center' ng-show='model.manageListModeOn()'>" +
                "<input type='checkbox' ng-click='model.select()' ng-model='model.selected'></td>",
            require: "^pmccTableSelectionModel"
        };

        function link(scope, element, attrs, parent) {

            var css = {
                    selected: "pmcc-selected"
                },
                tr = element.parent();

            scope.model = {
                manageListModeOn: function() {
                    return parent.isManageListModeOn;
                },
                rowId: attrs.pmccRowId,
                selected: false,
                select: function() {
                    parent.selectMany(scope);
                }
            };

            parent.register(scope);

            var watchSelected =
                scope.$watch('model.selected', function(newValue) {

                    if (newValue === true) {
                        tr.addClass(css.selected);
                    } else {
                        tr.removeClass(css.selected);
                    }

                });

            scope.$on("$destroy", function() {

                parent.deregister(scope);
                watchSelected();

            });

        }

    }

    function tableToggleManageList() {

        return {

            restrict: "E",
            template: "<pmcc-btn-toggle ng-model='model' ng-click='toggleManageListMode()'>Manage List</pmcc-btn-toggle>",
            replace: true,
            scope: true,
            require: "^pmccTableSelectionModel",
            link: function(scope, element, attr, parent) {

                scope.model = parent.isManageListModeOn;

                scope.toggleManageListMode = function() {
                    parent.isManageListModeOn = !parent.isManageListModeOn;
                };

            }

        };

    }

    function tableToggleSelectAll() {

        return {

            restrict: "A",
            template: "<th style='width:10px;text-align:center' ng-show='model.manageListModeOn()' ng-click='model.toggleAll()'><input type='checkbox' ng-disabled='!model.enabled' ng-model='model.selectAll'></th>",
            replace: true,
            scope: true,
            require: "^pmccTableSelectionModel",
            link: function(scope, element, attr, parent) {

                var self = this;


                scope.model = {

                    enabled: true,

                    selectAll: false,
                    setSelectAll: function(value) {
                        scope.model.selectAll = value;
                    },
                    toggleAll: function() {
                        parent.toggleAll(scope.model.selectAll);
                    },
                    manageListModeOn: function() {
                        return parent.isManageListModeOn;
                    }

                };

                if (attr.pmccTableToggleSelectAll === "false") {
                    scope.model.enabled = false;
                }

                parent.registerSelectAllFunction(scope.model.setSelectAll);


            }

        };
    }

})
();
(function() {


    angular.module("pmcc")

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccTabset //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    .directive("pmccTabset", function() {
            return {
                restrict: "E",
                transclude: true,
                scope: true,
                template: "<ul class='pmcc-tabs'>" +
                    "<li ng-class='{\"pmcc-tab-selected\":tab.selected, \"pmcc-tab-hidden\": tab.appearsInOverflowMenu}' " +
                    "ng-click='tab.action()' " +
                    "ng-repeat='tab in tabs'>" +
                    "{{tab.name}}" +
                    "</li>" +
                    "<pmcc-services-overflow items='tabs'></pmcc-services-overflow>" +
                    "</ul>" +
                    "<ng-transclude></ng-transclude>",
                controller: ["$scope", "$element", "$attrs", function($scope, $element, $attrs) {
                    $scope.tabs = [];

                    var styles = {
                        "tab": "pmcc-tab-style",
                        "pill": "pmcc-pill-style",
                        "panel": "pmcc-tab-panel-style"


                    };

                    this.maxHeight = $attrs.maxHeight;


                    var type = $attrs.type || "pill";
                    $element.addClass(styles[type]);

                    this.addTab = function(tab) {
                        tab.action = function() {
                            $scope.selectTab(tab);
                        };
                        $scope.tabs.push(tab);
                    };

                    $scope.selectTab = function(tab) {
                        for (var i = 0; i < $scope.tabs.length; i++) {
                            if (tab.name != $scope.tabs[i].name) {
                                $scope.tabs[i].selected = false;
                            } else {
                                $scope.tabs[i].selected = true;
                            }
                        }
                    };
                }]
            };
        })
        /**
         * @ngdoc directive // Mark the object as a directive
         * @name pmcc.pmccTab //start with the module name. the second part is always directive. the directive name goes after the the column
         * @restrict E //the elements the directive is restricted to.
         * @element ANY //will create a usage example combined with restrict
         * @priority 1000 //The higher the priority the sooner the directive gets compiled.
         * //@scope  //add this attribute if you create a scope in your directive.
         **/
        .directive("pmccTab", function() {
            return {
                restrict: "E",
                require: "^pmccTabset",
                transclude: true,
                scope: {
                    name: '@name'
                },
                template: "<div class='pmcc-tab-panel' ng-style='styling' ng-if='selected' ng-transclude></div>",
                link: function(scope, element, attrs, tabset) {

                    scope.selected = attrs.selected || attrs.selected === true;
                    scope.name = attrs.name;
                    var h = attrs.maxHeight || tabset.maxHeight || "auto";
                    scope.styling = {
                        "max-height": h
                    };
                    tabset.addTab(scope);

                }
            };
        });

})();

(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccTiles //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccTiles", function() {
            return {
                restrict: "E",
                template: "<div class='pmcc-tile-layout'>" +
                    "<div class='pmcc-tile' " +
                    "ng-style='getTileStyles( tile.id, $index )' " +
                    "ng-class='getCSSState( tile.id )' " +
                    "ng-repeat='tile in tileModel track by tile.id' " +
                    //"ng-click='toggleSelected( tile, $index )' " +
                    "ng-mouseover='over( tile.id )' " +
                    "ng-mouseout='out( tile.id )' " +
                    ">" +
                    "<div class='pmcc-tile-default' ng-include='defaultTileTemplate' style='getDefaultTileStyles()'></div>" +
                    "<div class='pmcc-tile-hover' ng-include='hoverTileTemplate' style='getHoverTileStyles()'></div>" +
                    "<div class='pmcc-tile-selected' ng-include='selectedTileTemplate' style='getSelectedTileStyles()'></div>" +
                    "</div>" +
                    "<div " +
                    "ng-model='detailModel'" +
                    "ng-style='getDetailStyles()' " +
                    "class='pmcc-tile-detail' " +
                    "ng-include='detailTemplate'></div>" +
                    "</div>",
                scope: {
                    defaultTileTemplate: "@",
                    hoverTileTemplate: "@",
                    selectedTileTemplate: "@",
                    detailTemplate: "@",
                    detailCallback: "&",
                    removeCallback: "&",
                    tileModel: "=",
                    detailModel: "=",
                    detailHeight: "@"
                },
                controllerAs: "tilesManager",
                controller: ["$scope", "$element", "$attrs", function($scope, $element, $attrs) {
                    var ctrl = this,
                        selectedTileIndex = -1,
                        selectedTile = null,
                        tileStateHash = {},
                        tileStates = {
                            closed: 0,
                            hovered: 1,
                            selected: 2
                        },
                        rowWidth = $attrs.rowWidth || 1200,
                        tilesPerRow = $attrs.tilePerRow || 4,
                        tileSize = rowWidth / tilesPerRow - 1;





                    function getTileState(id) {

                        if (!tileStateHash[id]) {
                            tileStateHash[id] = tileStates.closed;
                        }

                        return tileStateHash[id];
                    }

                    function setTileState(id, state) {
                        tileStateHash[id] = state;
                    }





                    function closeOtherTiles(dontCloseTileWithId) {

                        for (var id in tileStateHash) {
                            if (id != dontCloseTileWithId) {
                                setTileState(id, tileStates.closed);
                            }
                        }

                    }


                    function getRowFromIndex(index) {
                        return Math.floor(index / 4) * 2; //temp hard code 4 tiles per row
                    }

                    function getFlexOrder(index, offset) {
                        var o = getRowFromIndex(index) + offset;
                        return {
                            "-webkit-order": o,
                            "order": o
                        };
                    }

                    function selectTile(item, index) {
                        selectedTile = item;
                        selectedTileIndex = index;



                        $scope.detailCallback({
                            item: item
                        });


                    }

                    function deselectTile(item, index) {
                        selectedTile = null;
                        //selectedTileIndex = -1;
                    }


                    $scope.getTileStyles = function(id, index) {
                        var o = getFlexOrder(index, 0);
                        o.width = tileSize + "px";
                        o.height = tileSize + "px";

                        return o;
                    };

                    $scope.getDetailStyles = function(index) {
                        var o = getFlexOrder(selectedTileIndex, 1);
                        o.width = rowWidth + "px";

                        if (selectedTile) {
                            o.height = $scope.detailHeight || "200px";
                        } else {
                            o.height = 0;
                        }



                        return o;
                    };


                    $scope.getTileFlexOrder = function(index) {
                        return getFlexOrder(index, 0);
                    };


                    $scope.getTileDetailFlexOrder = function() {
                        return getFlexOrder(selectedTileIndex, 1);
                    };

                    $scope.over = function(id) {

                        if (getTileState(id) !== tileStates.selected)
                            setTileState(id, tileStates.hovered);

                    };

                    $scope.out = function(id) {

                        if (getTileState(id) !== tileStates.selected)
                            setTileState(id, tileStates.closed);

                    };

                    $scope.toggleSelected = function(item, index) {

                        if (getTileState(item.id) === tileStates.selected) {
                            setTileState(item.id, tileStates.closed);
                            deselectTile(item, index);
                        } else {
                            setTileState(item.id, tileStates.selected);
                            closeOtherTiles(item.id);
                            selectTile(item, index);
                        }

                    };

                    $scope.getCSSState = function getCSSState(id) {

                        switch (getTileState(id)) {
                            case tileStates.hovered:
                                return "pmcc-tile-hovered";
                            case tileStates.selected:
                                return "pmcc-tile-selected";
                            case tileStates.closed:
                                return "pmcc-tile-closed";
                            default:
                                return "pmcc-tile-closed";

                        }
                    };

                    $scope.getDetailTileStyles = function() {
                        return {
                            width: tileSize + "px",
                            height: tileSize + "px"
                        };
                    };

                    $scope.getHoverTileStyles = function() {
                        return {
                            width: tileSize + "px",
                            height: tileSize + "px"
                        };
                    };

                    $scope.getSelectedTileStyles = function() {
                        return {
                            width: tileSize + "px",
                            height: tileSize + "px"
                        };
                    };


                    ctrl.isSelected = function(id) {

                        return getTileState(id) === tileStates.selected;
                    };


                    ctrl.getTileState = getTileState;
                    ctrl.toggleSelected = $scope.toggleSelected;

                    return ctrl;

                }]
            };
        })


    .directive("pmccToggleTile", function() {
        return {
            restrict: "E",
            replace: true,
            require: "^pmccTiles",
            template: "<button class='pmcc-btn-sm pmcc-secondary pmcc-toggle-tile' ng-click='toggleTile($event)'>{{label()}} Details</button>",
            link: function(scope, element, attrs, tilesManager) {



                scope.label = function() {

                    return (tilesManager.isSelected(scope.tile.id)) ? "Hide" : "View";
                };


                scope.toggleTile = function(e) {
                    e.stopPropagation();
                    tilesManager.toggleSelected(scope.tile, scope.$index);
                };
            }

        };
    });



})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccToggleButton //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     * TODO: Should this just be an attribute that is tied to pmcc-buttons? Though the styles conflict.
     **/

    angular.module("pmcc")
        .directive("pmccToggleButton", function() {
            return {
                restrict: "E",
                require: "ngModel",
                link: function(scope, element, attrs, ngModel) {
                    scope.$watch(function() {
                        return ngModel.$modelValue;
                    }, function(modelValue) {
                        if (modelValue) {
                            element.addClass("active");
                        } else {
                            element.removeClass("active");
                        }
                    });
                    element.bind("click", function() {
                        scope.$apply(function() {
                            ngModel.$setViewValue(element.hasClass("active") ? false : true);
                        });
                    });
                }
            };
        });

})();

(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccTooltip //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccTooltip", [
            "$q",
            "$timeout",
            "$parse",
            "pmccServicesLayer",
            "pmccServicesUtilities",

            function($q,
                $timeout,
                $parse,
                pmccServicesLayer) {

                var css = {
                        tooltip: "pmcc-tooltip",
                        tooltipLayer: "pmcc-tooltip-layer"
                    },
                    layer = pmccServicesLayer.getTooltipLayer(),
                    debounce;

                function show(elm, content) {

                    var p = pmccServicesLayer.pointLayerAtElement(layer, elm[0]);

                    layer.style.top = p.top + "px";
                    layer.style.left = p.left + "px";
                    layer.className = css.tooltipLayer + " " + p.anchor;
                    layer.style.zIndex = pmccServicesLayer.getNextLayer();

                }

                function hide(elm) {

                    layer.style.top = "-10000px";
                    layer.style.left = "0px";
                    layer.style.width = "auto";

                }

                return {
                    restrict: "A",
                    scope: {
                        content: "&pmccContentProvider",
                        key: "@pmccContentKey",
                        contentString: "@pmccTooltip"
                    },
                    link: function(scope, element, attrs) {

                        element.addClass(css.tooltip);

                        element.bind("mouseenter", function() {

                            //todo: make the call to the content provider a promise (so we can support async content return)


                            hide(element);

                            debounce = $timeout(function() {

                                var content = (scope.contentString) ? scope.contentString : scope.content({
                                    key: scope.key
                                });
                                pmccServicesLayer.setTooltipContent(content);
                                show(element);

                            }, 400, false);

                        });

                        element.bind("mouseleave", function() {

                            $timeout.cancel(debounce);
                            hide(element);

                        });

                        //clean up when this directive is destroyed
                        scope.$on("$destroy", function(event) {

                            $timeout.cancel(debounce);
                            element.unbind("mouseenter");
                            element.unbind("mouseleave");
                        });

                    }
                };
            }
        ]);

})();
(function() {

    /**
     * @ngdoc directive // Mark the object as a directive
     * @name pmcc.pmccUniHeader //start with the module name. the second part is always directive. the directive name goes after the the column
     * @restrict E //the elements the directive is restricted to.
     * @element ANY //will create a usage example combined with restrict
     * @priority 1000 //The higher the priority the sooner the directive gets compiled.
     * //@scope  //add this attribute if you create a scope in your directive.
     **/

    angular.module("pmcc")
        .directive("pmccUniHeader", function() {
            return {
                restrict: "E",
                transclude: true,
                template: "<ng-transclude></ng-transclude>",
                link: function(scope, element, attrs) {


                    /*if you add watchers to your scope,
                     * or make use of async stuff like $timeout
                     * don't forget to destroy them
                     *
                     * scope.$on("$destroy", function(){
                     *
                     * });
                     * */


                }
            };
        });

})();
