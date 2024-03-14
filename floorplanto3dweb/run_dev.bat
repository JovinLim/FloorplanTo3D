set BASH=C:\Program Files\Git\bin\sh.exe --login -i -c
set BACKEND=%BASH% "conda deactivate && conda activate GNN && npm run fserver || /usr/bin/bash && /usr/bin/bash"
set FRONTEND=%BASH% "conda deactivate && conda activate GNN && npm run start || /usr/bin/bash && /usr/bin/bash"
wt -d "." -p "Git Bash" %BACKEND%; split-pane -V -p "Git Bash"  %FRONTEND%;