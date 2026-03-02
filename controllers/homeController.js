exports.index = (req, res) => {
  res.render('index', { title: 'Home' });
};

exports.flashTest = (req, res) => {
  req.flash('success_msg', 'Operação realizada com sucesso.');
  res.redirect('/');
};
