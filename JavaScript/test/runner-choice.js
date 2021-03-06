var _ = require('lodash');
var ChoiceRecognizer = require('@microsoft/recognizers-text-choice').ChoiceRecognizer;
var SupportedCultures = require('./cultures.js');

var modelGetters = {
    'BooleanModel': ChoiceRecognizer.instance.getBooleanModel
};

module.exports = function getChoiceTestRunner(config) {
    try {
        var model = getChoiceModel(config);
    } catch (err) {
        return null;
    }

    return function (t, testCase) {

        if (testCase.Debug) debugger;
        var result = model.parse(testCase.Input);

        t.is(result.length, testCase.Results.length, 'Result count');
        _.zip(result, testCase.Results).forEach(o => {
            var actual = o[0];
            var expected = o[1];
            t.is(actual.text, expected.Text, 'Result.Text');
            t.is(actual.typeName, expected.TypeName, 'Result.TypeName');

            // Check resolution is defined (or not) in both actual and expected
            t.is(!!actual.resolution, !!expected.Resolution, 'Result.Resolution is defined');
            if(!actual.resolution) return;

            t.is(actual.resolution.value, expected.Resolution.value, 'Result.Resolution.value');
            t.is(actual.resolution.score, expected.Resolution.score, 'Result.Resolution.unit');
        });
    };
}

function getChoiceModel(config) {
    var getModel = modelGetters[config.subType];
    if (!getModel) {
        throw new Error(`Choice model of ${config.subType} not supported.`);
    }

    var culture = SupportedCultures[config.language].cultureCode;
    if (!culture) {
        throw new Error(`Choice model of ${config.subType} with culture ${config.language} not supported.`);
    }

    return getModel.bind(ChoiceRecognizer.instance)(culture, false);
}