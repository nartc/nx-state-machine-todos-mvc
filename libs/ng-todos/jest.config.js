module.exports = {
  name: 'ng-todos',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/ng-todos',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
