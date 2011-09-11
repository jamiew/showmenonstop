# Adopted from Scott Kyle's Rakefile
# http://github.com/appden/appden.github.com/blob/master/Rakefile

# task :default => :deploy

desc 'Deploy'
task :deploy do
  sh 'rsync -rtzh --progress --delete ./ jamiew@txd:~/web/public/nonstop/'
end
